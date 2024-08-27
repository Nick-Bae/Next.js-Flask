from app import app, db
from app.models.bible import Bible
from sqlalchemy.sql import func
import json

# Mapping of book names to abbreviations
book_abbreviations = {
    "Genesis": "Gen",
    "Exodus": "Exod",
    "Leviticus": "Lev",
    "Numbers": "Num",
    "Deuteronomy": "Deut",
    "Joshua": "Josh",
    "Judges": "Judg",
    "Ruth": "Ruth",
    "1 Samuel": "1Sam",
    "2 Samuel": "2Sam",
    "1 Kings": "1Kgs",
    "2 Kings": "2Kgs",
    "1 Chronicles": "1Chr",
    "2 Chronicles": "2Chr",
    "Ezra": "Ezra",
    "Nehemiah": "Neh",
    "Esther": "Est",
    "Job": "Job",
    "Psalms": "Ps",
    "Proverbs": "Prov",
    "Ecclesiastes": "Eccl",
    "Song of Solomon": "Song",
    "Isaiah": "Isa",
    "Jeremiah": "Jer",
    "Lamentations": "Lam",
    "Ezekiel": "Ezek",
    "Daniel": "Dan",
    "Hosea": "Hos",
    "Joel": "Joel",
    "Amos": "Amos",
    "Obadiah": "Obad",
    "Jonah": "Jonah",
    "Micah": "Mic",
    "Nahum": "Nah",
    "Habakkuk": "Hab",
    "Zephaniah": "Zeph",
    "Haggai": "Hag",
    "Zechariah": "Zech",
    "Malachi": "Mal",
    "Matthew": "Matt",
    "Mark": "Mark",
    "Luke": "Luke",
    "John": "John",
    "Acts": "Acts",
    "Romans": "Rom",
    "1 Corinthians": "1Cor",
    "2 Corinthians": "2Cor",
    "Galatians": "Gal",
    "Ephesians": "Eph",
    "Philippians": "Phil",
    "Colossians": "Col",
    "1 Thessalonians": "1Thess",
    "2 Thessalonians": "2Thess",
    "1 Timothy": "1Tim",
    "2 Timothy": "2Tim",
    "Titus": "Titus",
    "Philemon": "Philem",
    "Hebrews": "Heb",
    "James": "Jas",
    "1 Peter": "1Pet",
    "2 Peter": "2Pet",
    "1 John": "1John",
    "2 John": "2John",
    "3 John": "3John",
    "Jude": "Jude",
    "Revelation": "Rev"
}

def generate_verse_id(book_name, chapter_index, verse_index):
    # Combine book number, chapter, and verse into a smaller integer
    book_number = list(book_abbreviations.keys()).index(book_name) + 1
    verse_id = book_number * 1000000 + chapter_index * 1000 + verse_index
    return verse_id

# Use the existing app and its context
with app.app_context():
    # Load the ESV data from the JSON file
    with open('app/seeds/ESV_bible.json', 'r', encoding='utf-8') as file:
        esv_data = json.load(file)

    # Seed the database
    def seed_bible_data(data):
        for book_name, chapters in data.items():
            abbrev = book_abbreviations.get(book_name, book_name[:3])  # Get abbreviation or use first 3 letters
            for chapter_index, verses in chapters.items():
                for verse_index, verse_text in verses.items():
                    verse_id = generate_verse_id(book_name, int(chapter_index), int(verse_index))
                    try:
                        bible_entry = Bible(
                            verse_id=verse_id,
                            book=book_name,
                            abb=abbrev,
                            chapter=int(chapter_index),
                            verse=int(verse_index),
                            text=verse_text,
                            version="ESV"
                            # Note: Do NOT include search_vector here
                        )
                        db.session.add(bible_entry)
                    except Exception as e:
                        print(f"Error inserting verse: {book_name} {chapter_index}:{verse_index}")
                        print("Verse text:", verse_text)
                        raise e
        db.session.commit()

    # Seed the data
    seed_bible_data(esv_data)
