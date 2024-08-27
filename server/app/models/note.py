from .db import db
from datetime import datetime

class Note(db.Model):
    __tablename__ = 'note'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255))  # Optional title for the note
    text = db.Column(db.Text, nullable=False)
    verse_id = db.Column(db.Integer, db.ForeignKey('bible.verse_id'), nullable=False)  # Foreign key to the Bible table
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('notes', lazy=True))
    bible = db.relationship('Bible', backref=db.backref('notes', lazy=True))

    def __repr__(self):
        return f'<Note {self.id} - {self.title}>'
