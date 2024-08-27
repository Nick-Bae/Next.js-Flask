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

# Use the existing app and its context
with app.app_context():
    db.session.query(Bible).delete()
    # Load the NLT data from the JSON file
    with open('app/seeds/NLT_bible.json', 'r', encoding='utf-8') as file:
        niv_data = json.load(file)

    # Function to seed the data with search_vector
    def seed_bible_data(data):
        for book, chapters in data.items():
            abb = book_abbreviations.get(book, book[:3])  # Get abbreviation or use first 3 letters
            for chapter_num, verses in chapters.items():
                for verse_num, verse_text in verses.items():
                    bible_entry = Bible(
                        version="NLT",
                        book=book,
                        abb=abb,
                        chapter=int(chapter_num),
                        verse=int(verse_num),
                        text=verse_text,
                        search_vector=func.to_tsvector('english', verse_text)  # Generate search vector for English text
                    )
                    db.session.add(bible_entry)
        
        db.session.commit()

    # Seed the data
    seed_bible_data(niv_data)
