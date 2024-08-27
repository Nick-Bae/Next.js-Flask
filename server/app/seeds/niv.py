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
    "Psalms": "Ps",  # This is plural
    "Proverbs": "Prov",
    "Ecclesiastes": "Eccl",
    "Song of Solomon": "Song",  # Correct case
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

def generate_verse_id(book, chapter, verse):
    normalized_book = book.title().replace(" Of ", " of ")
    if normalized_book == "Psalm":
        normalized_book = "Psalms"  # Handle singular form of "Psalm"
    book_number = list(book_abbreviations.keys()).index(normalized_book) + 1
    return book_number * 1000000 + chapter * 1000 + verse

# Use the existing app and its context
with app.app_context():
    # Load the NIV data from the JSON file
    with open('app/seeds/NIV_bible.json', 'r', encoding='utf-8') as file:
        niv_data = json.load(file)

    def seed_bible_data(data):
        for book, chapters in data.items():
            normalized_book = book.title().replace(" Of ", " of ")
            if normalized_book == "Psalm":
                normalized_book = "Psalms"
            abb = book_abbreviations.get(normalized_book, book[:3])  # Use title-cased book name
            for chapter_num, verses in chapters.items():
                for verse_num, verse_text in verses.items():
                    verse_id = generate_verse_id(normalized_book, int(chapter_num), int(verse_num))
                    bible_entry = Bible(
                        version="NIV",
                        book=normalized_book,
                        abb=abb,
                        chapter=int(chapter_num),
                        verse=int(verse_num),
                        verse_id=verse_id,
                        text=verse_text
                    )
                    db.session.add(bible_entry)
        
        db.session.commit()

    # Seed the data
    seed_bible_data(niv_data)