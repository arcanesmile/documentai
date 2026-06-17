import requests, json, time
BASE = 'http://localhost:8000'

# 1. Signup (ignore if already exists)
r = requests.post(f'{BASE}/api/auth/signup', json={'name':'Test User','email':'flow4@example.com','password':'Pass123!'})
if r.status_code == 201:
    print('Signup OK')
elif 'already' in r.text:
    print('User exists, logging in...')
else:
    print(f'Signup unexpected: {r.status_code} {r.text}')

# 2. Login
r = requests.post(f'{BASE}/api/auth/login', json={'email':'flow4@example.com','password':'Pass123!'})
assert r.status_code == 200, f'Login failed: {r.text}'
token = r.json()['access_token']
user_id = r.json()['user']['id']
print(f'Login OK. User: {user_id}')

# 3. Upload document
r = requests.post(f'{BASE}/api/documents/upload', files={'file':('test.txt',b'Artificial intelligence is transforming search engines. Semantic search understands meaning and context.','text/plain')}, headers={'Authorization':f'Bearer {token}'})
print(f'Upload: {r.status_code}')
if r.status_code == 201:
    doc_id = r.json().get('id','?')
    print(f'Document ID: {doc_id}')
else:
    print(f'Upload failed: {r.text}')

# 4. List documents
r = requests.get(f'{BASE}/api/documents', headers={'Authorization':f'Bearer {token}'})
print(f'Documents: {r.status_code} - Count: {len(r.json())}')

# 5. Search
r = requests.post(f'{BASE}/api/search', json={'query':'what is semantic search'}, headers={'Authorization':f'Bearer {token}'})
print(f'Search: {r.status_code}')
if r.status_code == 200:
    results = r.json().get('results', [])
    print(f'Results: {len(results)}')
    for res in results[:2]:
        sim = res['similarity']
        content = res['content'][:80]
        print(f'  [{sim:.2f}] {content}')
else:
    print(f'Search failed: {r.text}')

print('\n=== FLOW TEST COMPLETE ===')

