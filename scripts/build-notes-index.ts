import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { GoogleGenAI } from "@google/genai";

interface NoteFrontmatter {
  title?: string;
  date?: string;
  tags?: string[];
  category?: string;
  author?: string;
  description?: string;
}

interface Note {
  id: string;
  slug: string;
  filepath: string;
  folder: string;
  filename: string;
  frontmatter: NoteFrontmatter;
  content: string;
  excerpt: string;
  createdAt: string;
  modifiedAt: string;
}

interface Folder {
  name: string;
  path: string;
  noteCount: number;
  notes: Note[];
}

interface NotesIndex {
  folders: Folder[];
  notes: Note[];
}

const NOTES_DIR = path.join(process.cwd(), "notes");
const OUTPUT_FILE = path.join(process.cwd(), "public", "notes-index.json");

function generateSlug(folder: string, filename: string): string {
  const name = filename.replace(/\.md$/, "");
  return `${folder}/${name}`.toLowerCase().replace(/\s+/g, "-");
}

function extractTitleFromContent(content: string): string | undefined {
  // Try to find the first heading (h1 or h2)
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();

  const h2Match = content.match(/^##\s+(.+)$/m);
  if (h2Match) return h2Match[1].trim();

  return undefined;
}

function extractTagsFromContent(content: string): string[] {
  const tags = new Set<string>();

  // Look for common code language tags
  const codeBlocks = content.match(/```(\w+)/g);
  if (codeBlocks) {
    codeBlocks.forEach((block) => {
      const lang = block.replace("```", "");
      if (lang && lang !== "markdown" && lang !== "md") {
        tags.add(lang);
      }
    });
  }

  // Look for hashtags (not markdown headers)
  const hashtagMatches = content.matchAll(/(?:^|[^\w#])#(\w+)(?:[^\w]|$)/gm);
  for (const match of hashtagMatches) {
    tags.add(match[1].toLowerCase());
  }

  return Array.from(tags).slice(0, 10); // Limit to 10 tags
}

function generateExcerpt(content: string, maxLength = 200): string {
  // Remove markdown syntax for excerpt
  const plainText = content
    .replace(/^---[\s\S]*?---/, "") // Remove frontmatter
    .replace(/#{1,6}\s/g, "") // Remove headers
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Convert links to text
    .replace(/`{1,3}[^`]*`{1,3}/g, "") // Remove code
    .replace(/[*_~]/g, "") // Remove emphasis
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + "...";
}

function sanitizePlainText(content: string): string {
  return content
    .replace(/^---[\s\S]*?---/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/#+\s/g, "")
    .replace(/[*_~>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const ai = new GoogleGenAI({});

async function generateAiMetadata(
  title: string,
  content: string,
  folder: string,
): Promise<{ tags: string[]; description: string } | null> {
  const text = sanitizePlainText(content);
  if (!text) {
    return null;
  }

  const prompt = `You are helping build metadata for a personal notes app.
Return JSON only with keys: tags (array of 4-8 short lowercase tags), description (1 sentence, <=160 chars).
Use the note title and content. Avoid generic tags like "note" or "personal".

Title: ${title}
Folder: ${folder}
Content: ${text.slice(0, 4000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const rawText = response.text?.trim() ?? "";
    if (!rawText) {
      return null;
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);

    const tags = Array.isArray(parsed.tags)
      ? parsed.tags
          .map((tag: string) => tag.toLowerCase().trim())
          .filter(Boolean)
          .slice(0, 8)
      : [];

    const description =
      typeof parsed.description === "string" ? parsed.description.trim() : "";

    if (!tags.length && !description) {
      return null;
    }

    return { tags, description };
  } catch (error) {
    console.warn("Warning: AI metadata generation failed:", error);
    return null;
  }
}

async function processMarkdownFile(
  filePath: string,
  folder: string,
  filename: string,
): Promise<Note> {
  const content = await fs.readFile(filePath, "utf-8");
  const { data, content: markdownContent } = matter(content);
  const stats = await fs.stat(filePath);

  const slug = generateSlug(folder, filename);
  const id = `${folder}-${filename}`.replace(/[^a-z0-9]/gi, "-").toLowerCase();

  // Extract metadata from content if not present in frontmatter
  const extractedTitle = extractTitleFromContent(markdownContent);
  const extractedTags = extractTagsFromContent(markdownContent);
  const baseTitle =
    data.title || extractedTitle || filename.replace(/\.md$/, "");

  const aiMetadata = await generateAiMetadata(
    baseTitle,
    markdownContent,
    folder,
  );

  // Merge frontmatter with extracted data (frontmatter takes precedence)
  const frontmatter: NoteFrontmatter = {
    title: baseTitle,
    date: data.date || stats.mtime.toISOString().split("T")[0],
    tags:
      data.tags ||
      (aiMetadata?.tags.length ? aiMetadata.tags : undefined) ||
      (extractedTags.length > 0 ? extractedTags : undefined),
    category: data.category || folder,
    author: data.author,
    description: data.description || aiMetadata?.description,
  };

  return {
    id,
    slug,
    filepath: path.relative(NOTES_DIR, filePath),
    folder,
    filename,
    frontmatter,
    content: markdownContent,
    excerpt: aiMetadata?.description || generateExcerpt(markdownContent),
    createdAt: stats.birthtime.toISOString(),
    modifiedAt: stats.mtime.toISOString(),
  };
}

async function scanNotesDirectory(): Promise<NotesIndex> {
  const folders: Folder[] = [];
  const allNotes: Note[] = [];

  const walkDirectory = async (relativeFolder: string) => {
    const folderPath = path.join(NOTES_DIR, relativeFolder);
    const notes: Note[] = [];

    try {
      const entries = await fs.readdir(folderPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const childRelative = path.join(relativeFolder, entry.name);
          await walkDirectory(childRelative);
        } else if (entry.name.endsWith(".md")) {
          const filePath = path.join(folderPath, entry.name);
          const note = await processMarkdownFile(
            filePath,
            relativeFolder,
            entry.name,
          );
          notes.push(note);
          allNotes.push(note);
        }
      }

      folders.push({
        name: relativeFolder,
        path: relativeFolder,
        noteCount: notes.length,
        notes,
      });
    } catch (error) {
      console.warn(`Warning: Could not read folder ${relativeFolder}:`, error);
    }
  };

  try {
    const entries = await fs.readdir(NOTES_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        await walkDirectory(entry.name);
      }
    }

    // Sort folders and notes
    folders.sort((a, b) => a.name.localeCompare(b.name));
    allNotes.sort(
      (a, b) =>
        a.folder.localeCompare(b.folder) ||
        a.filename.localeCompare(b.filename),
    );

    return { folders, notes: allNotes };
  } catch (error) {
    console.error("Error scanning notes directory:", error);
    return { folders: [], notes: [] };
  }
}

async function main() {
  console.log("🔍 Scanning notes directory...");

  const notesIndex = await scanNotesDirectory();

  console.log(`✓ Found ${notesIndex.folders.length} folders`);
  console.log(`✓ Found ${notesIndex.notes.length} notes`);

  // Ensure public directory exists
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

  // Write index file
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(notesIndex, null, 2), "utf-8");

  console.log(`✓ Generated notes index: ${OUTPUT_FILE}`);

  // Print summary
  for (const folder of notesIndex.folders) {
    console.log(`  📁 ${folder.name}: ${folder.noteCount} notes`);
  }
}

main().catch((error) => {
  console.error("Error generating notes index:", error);
  process.exit(1);
});
