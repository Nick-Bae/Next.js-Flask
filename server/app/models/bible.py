from .db import db
from sqlalchemy import Index
from sqlalchemy.dialects.postgresql import TSVECTOR

class Bible(db.Model):
    __tablename__ = 'bible'

    id = db.Column(db.Integer, primary_key=True)
    version = db.Column(db.String(20), nullable=False)
    book = db.Column(db.String(50), nullable=False, index=True)
    abb = db.Column(db.String(10))
    chapter = db.Column(db.Integer, nullable=False)
    verse = db.Column(db.Integer, nullable=False)
    verse_id = db.Column(db.Integer, nullable=False, unique=True, index=True)
    text = db.Column(db.Text, nullable=False)
    search_vector = db.Column(TSVECTOR, db.Computed("to_tsvector('english', text)", persisted=True))

    __table_args__ = (
        Index('ix_bible_book_chapter_verse', 'book', 'chapter', 'verse'),
        Index('ix_bible_search_vector', 'search_vector', postgresql_using='gin'),
    )

    def __repr__(self):
        return f'<Bible {self.version} {self.book} {self.chapter}:{self.verse}>'
