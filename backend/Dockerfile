FROM python:alpine

WORKDIR /app

RUN adduser -D appuser

COPY --chown=appuser:appuser requirements.txt .

ENV MONGO_URI="mongodb://admin:secretpassword@mongodb:27017/notes_app?authSource=admin"

RUN pip install -r requirements.txt

COPY --chown=appuser:appuser . .

EXPOSE 8000

USER appuser

CMD ["python", "app.py"]