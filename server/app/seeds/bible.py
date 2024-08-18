import json, os
from sqlalchemy import create_engine, Column, Integer, String, Text, Table, MetaData, func
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import TSVECTOR
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("No DATABASE_URL set for the database connection.")

# Set up the database connection and session
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Define the metadata
metadata = MetaData()

# Define the bible table
bible_table = Table(
    'bible', metadata,
    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('version', String(10)),
    Column('book', String(50)),
    Column('abb', String(10)),
    Column('chapter', Integer),
    Column('verse', Integer),
    Column('text', Text),
    Column('search_vector', TSVECTOR)
)

# Assuming you have a JSON file named 'ko_rev.json'
with open('ko_rev.json', 'r', encoding='utf-8') as file:
    source_data = json.load(file)

# Seed the database
def seed_bible_table(data, session):
    for book in data:
        book_name = book['name']
        abbrev = book['abbrev']
        chapters = book['chapters']

        for chapter_index, verses in enumerate(chapters, start=1):
            for verse_index, verse_text in enumerate(verses, start=1):
                try:
                    insert_stmt = bible_table.insert().values(
                        book=book_name,
                        abb=abbrev,
                        chapter=chapter_index,
                        verse=verse_index,
                        text=verse_text,
                        version="KRV",
                        search_vector=func.to_tsvector('korean', verse_text)
                    )
                    session.execute(insert_stmt)
                except Exception as e:
                    print(f"Error inserting verse: {book_name} {chapter_index}:{verse_index}")
                    print("Verse text:", verse_text)
                    raise e
    session.commit()

# Create the table if it doesn't exist
metadata.create_all(engine)

# Seed the bible table
seed_bible_table(source_data, session)

# Close the session
session.close()
