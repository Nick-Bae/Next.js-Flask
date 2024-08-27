import json
import os
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
    Column('verse_id', Integer, nullable=False),  # Include verse_id
    Column('version', String(10)),
    Column('book', String(50)),
    Column('abb', String(10)),
    Column('chapter', Integer),
    Column('verse', Integer),
    Column('text', Text),
    Column('search_vector', TSVECTOR)  # Do not manually insert values here
)

base_dir = os.path.abspath(os.path.dirname(__file__))
file_path = os.path.join(base_dir, 'ko_rev.json')

with open(file_path, 'r', encoding='utf-8') as file:
    source_data = json.load(file)

    book_abbreviations = {
        
    "창세기": "창",
    "출애굽기": "출",
    "레위기": "레",
    "민수기": "민",
    "신명기": "신",
    "여호수아": "수",
    "사사기": "삿",
    "룻기": "룻",
    "사무엘상": "삼상",
    "사무엘하": "삼하",
    "열왕기상": "왕상",
    "열왕기하": "왕하",
    "역대상": "대상",
    "역대하": "대하",
    "에스라": "스",
    "느헤미야": "느",
    "에스더": "에",
    "욥기": "욥",
    "시편": "시",
    "잠언": "잠",
    "전도서": "전",
    "아가": "아",
    "이사야": "사",
    "예레미야": "렘",
    "예레미야애가": "애",
    "에스겔": "겔",
    "다니엘": "단",
    "호세아": "호",
    "요엘": "욜",
    "아모스": "암",
    "오바댜": "옵",
    "요나": "욘",
    "미가": "미",
    "나훔": "나",
    "하박국": "합",
    "스바냐": "습",
    "학개": "학",
    "스가랴": "슥",
    "말라기": "말",
    "마태복음": "마",
    "마가복음": "막",
    "누가복음": "눅",
    "요한복음": "요",
    "사도행전": "행",
    "로마서": "롬",
    "고린도전서": "고전",
    "고린도후서": "고후",
    "갈라디아서": "갈",
    "에베소서": "엡",
    "빌립보서": "빌",
    "골로새서": "골",
    "데살로니가전서": "살전",
    "데살로니가후서": "살후",
    "디모데전서": "딤전",
    "디모데후서": "딤후",
    "디도서": "딛",
    "빌레몬서": "몬",
    "히브리서": "히",
    "야고보서": "약",
    "베드로전서": "벧전",
    "베드로후서": "벧후",
    "요한1서": "요일",
    "요한2서": "요이",
    "요한3서": "요삼",
    "유다서": "유",
    "요한계시록": "계"
}
def generate_verse_id(book, chapter, verse):
    book_number = list(book_abbreviations.keys()).index(book) + 1
    return book_number * 1000000 + chapter * 1000 + verse

# Seed the database
def seed_bible_table(data, session):
    for book in data:
        book_name = book['name']
        abbrev = book_abbreviations.get(book_name)
        chapters = book['chapters']

        for chapter_index, verses in enumerate(chapters, start=1):
            for verse_index, verse_text in enumerate(verses, start=1):
                verse_id = generate_verse_id(book_name, chapter_index, verse_index)
                try:
                    insert_stmt = bible_table.insert().values(
                        verse_id=verse_id,
                        book=book_name,
                        abb=abbrev,
                        chapter=chapter_index,
                        verse=verse_index,
                        text=verse_text,
                        version="KRV"
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
