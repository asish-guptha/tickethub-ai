# Grab a lightweight version of Python
FROM python:3.10-slim

# Stop Python from generating annoying temporary files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set up a working directory inside the container
WORKDIR /app

# Copy our requirements file first and install the tools
COPY requirements.txt /app/
RUN pip install -r requirements.txt

# Copy the rest of our backend code into the container
COPY . /app/