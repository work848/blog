import sqlite3

conn = sqlite3.connect(r'e:\work\blog\backend\data\blog.db')
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = cursor.fetchall()
print('Tables:', [t[0] for t in tables])

print('\n=== user table schema ===')
cursor.execute('PRAGMA table_info(user)')
for col in cursor.fetchall():
    print(f'  {col[1]} ({col[2]})')

print('\n=== user data ===')
cursor.execute('SELECT * FROM user')
users = cursor.fetchall()
print(f'User count: {len(users)}')
for u in users:
    print(f'  {u}')

print('\n=== settings data ===')
cursor.execute('SELECT * FROM settings')
settings = cursor.fetchall()
print(f'Settings count: {len(settings)}')
for s in settings:
    print(f'  {s}')

conn.close()
