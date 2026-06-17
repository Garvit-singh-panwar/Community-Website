# 1. Start with a clean Ubuntu Linux operating system
FROM ubuntu:22.04

# 2. Prevent interactive prompt freezes during installation
ENV DEBIAN_FRONTEND=noninteractive

# 3. Install compilers and runtimes for C++, Python, Java, and JavaScript
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    openjdk-17-jdk \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

# 4. Create a folder inside this container where the code will be placed
WORKDIR /app