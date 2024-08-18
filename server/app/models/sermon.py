from datetime import datetime

class Sermon(db.Model):
    __tablename__ = 'sermon'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False, index=True)
    category = db.Column(db.String(50), nullable=False, index=True)
    preacher = db.Column(db.String(100))  # Optional preacher name
    date_preached = db.Column(db.Date)  # The date the sermon was delivered
    summary = db.Column(db.Text)  # Optional short summary of the sermon
    text = db.Column(db.Text, nullable=False)
    bible_id = db.Column(db.Integer, db.ForeignKey('bible.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bible = db.relationship('Bible', backref=db.backref('sermons', lazy='dynamic'))

    def __repr__(self):
        return f'<Sermon {self.title} - {self.category}>'
