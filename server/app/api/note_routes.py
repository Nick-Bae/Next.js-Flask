from datetime import datetime
from flask import Blueprint, request, jsonify
from app.models import db, Note, Bible
from flask_login import current_user, login_user, logout_user, login_required, current_user

note_routes = Blueprint('note_routes', __name__)

# Create a new note
@note_routes.route('/', methods=['POST'])
@login_required
def create_note():
    data = request.get_json()

    # Ensure verse_id is provided in the request
    verse_id = data.get('verse_id')
    
    if not verse_id:
        return jsonify({"error": "verse_id is required"}), 400

    # Optionally, verify that the verse_id exists in the Bible table
    # bible_entry = Bible.query.filter_by(verse_id=verse_id).first()
    # if not bible_entry:
    #     return jsonify({"error": "Invalid verse_id"}), 404

    # Create and save the note
    note = Note(
        user_id=current_user.id,
        title=data.get('title'),
        text=data.get('text'),
        verse_id=verse_id
    )
    
    db.session.add(note)
    db.session.commit()

    # Prepare the response data
    note_response = {
         "id": note.id,
         "user_id": current_user.username,
         "text": note.text,
         "verse_id": note.verse_id,
    }

    # Return the note as a JSON response with a 201 status code
    return jsonify(note_response), 201

# Get all notes for a specific Bible passage
@note_routes.route('/<int:verse_id>', methods=['GET'])
@login_required
def get_notes(verse_id):
    notes = Note.query.filter_by(verse_id=verse_id).all()
    return jsonify([{'id': note.id, "user" : current_user.username ,'title': note.title, 'text': note.text, 'created_at': note.created_at, 'updated_at': note.updated_at} for note in notes]), 200

# Get a specific note
@note_routes.route('/detail/<int:id>', methods=['GET'])
@login_required
def get_note(id):
    note = Note.query.get_or_404(id)
    return jsonify({'id': note.id, "user" : current_user.username ,'title': note.title, 'text': note.text, 'verse_id': note.verse_id, 'created_at': note.created_at, 'updated_at': note.updated_at}), 200

# Update an existing note
@note_routes.route('/detail/<int:id>', methods=['PUT'])
@login_required
def update_note(id):
    data = request.get_json()
    note = Note.query.get_or_404(id)

    note.title = data.get('title', note.title)
    note.text = data['text']
    note.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify({'id': note.id, "user" : current_user.username ,'title': note.title, 'text': note.text, 'verse_id': note.verse_id, 'created_at': note.created_at, 'updated_at': note.updated_at}), 200

# Delete a note
@note_routes.route('/detail/<int:id>', methods=['DELETE'])
@login_required
def delete_note(id):
    note = Note.query.get_or_404(id)
    db.session.delete(note)
    db.session.commit()

    return jsonify({'message': 'Note deleted successfully'}), 200
