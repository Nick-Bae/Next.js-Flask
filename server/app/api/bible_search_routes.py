from flask import Flask, request, jsonify, Blueprint
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from app.models import db, Bible

search_bible = Blueprint('search_bible', __name__)

def parse_input(search_input):
    # Regular expression to extract book name/abbreviation, chapter, and verse
    match = re.match(r"([가-힣a-zA-Z]+)(\d+):(\d+)", search_input)
    if match:
        book = match.group(1)
        chapter = int(match.group(2))
        verse = int(match.group(3))
        return book, chapter, verse
    return None, None, None

@search_bible.route('')
def search():
    query = request.args.get('query', type=str)
    book = request.args.get('book', type=str)
    chapter = request.args.get('chapter', type=int)
    verse = request.args.get('verse', type=int)
    page = request.args.get('page', 1, type=int)  # Defaults to first page
    per_page = request.args.get('per_page', 10, type=int)  # Defaults to 10 items per page

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)  # Default to 10 items per page

    bible_query = Bible.query

    if book:
         bible_query = bible_query.filter(
            (Bible.book.ilike(f'%{book}%')) | (Bible.abb.ilike(f'%{book}%'))
        )
    if chapter is not None:
        bible_query = bible_query.filter(Bible.chapter == chapter)
    if verse is not None:
        bible_query = bible_query.filter(Bible.verse == verse)
    if query:
        bible_query = bible_query.filter(Bible.text.ilike(f'%{query}%'))

    paginated_results = bible_query.paginate(page=page, per_page=per_page)

    results = [{
        'version': item.version,
        'book': item.book,
        'chapter': item.chapter,
        'verse': item.verse,
        'text': item.text
    } for item in paginated_results.items]

    return jsonify(results)

@search_bible.errorhandler(Exception)
def handle_exception(e):
    return jsonify({'error': str(e)}), 500
