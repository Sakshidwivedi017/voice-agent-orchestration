import sys

with open('.env', 'r') as f:
    for line in f:
        if 'DATABASE_URL' in line:
            print(f"RAW LINE: {repr(line)}")
            val = line.split('=', 1)[1].strip().strip('"')
            print(f"PARSED VAL: {repr(val)}")
