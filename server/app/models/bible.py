from .db import db
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy import Index

class Bible(db.Model):
    __tablename__ = 'bible'

    id = db.Column(db.Integer, primary_key=True)
    version = db.Column(db.String(20), nullable=False)
    book = db.Column(db.String(50), nullable=False, index=True)  # Indexed for direct book queries
    abb = db.Column(db.String(10))
    chapter = db.Column(db.Integer, nullable=False)  # Part of composite index
    verse = db.Column(db.Integer, nullable=False)  # Part of composite index
    text = db.Column(db.Text, nullable=False)
    search_vector = db.Column(TSVECTOR, db.Computed("to_tsvector('simple', text)", persisted=True))  # Use 'simple' for broader compatibility

    # Composite index for book, chapter, and verse
    __table_args__ = (
        Index('ix_bible_book_chapter_verse', 'book', 'chapter', 'verse'),
        Index('ix_bible_search_vector', 'search_vector', postgresql_using='gin'),
    )

    def __repr__(self):
        return f'<Bible {self.version} {self.book} {self.chapter}:{self.verse}>'
