from datetime import datetime

class Note(db.Model):
    __tablename__ = 'note'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255))  # Optional title for the note
    text = db.Column(db.Text, nullable=False)
    bible_id = db.Column(db.Integer, db.ForeignKey('bible.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bible = db.relationship('Bible', backref=db.backref('notes', lazy=True))

    def __repr__(self):
        return f'<Note {self.id} - {self.title}>'
