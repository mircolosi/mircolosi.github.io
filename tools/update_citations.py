import json
import urllib.request
import urllib.parse
import os

JSON_PATH = 'resources/publications.json' # Adjust path as needed
SS_BATCH_API = 'https://api.semanticscholar.org/graph/v1/paper/batch?fields=citationCount'

def main():
    if not os.path.exists(JSON_PATH):
        print(f"Could not find {JSON_PATH}")
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        publications = json.load(f)

    # Collect paper IDs that need updating
    paper_ids = [pub['paperId'] for pub in publications if 'paperId' in pub and pub['paperId']]
    print(paper_ids)
    
    if not paper_ids:
        print("No paper IDs found to update.")
        return

    # Call Semantic Scholar Batch API
    payload = json.dumps({'ids': paper_ids}).encode('utf-8')
    print(payload)
    req = urllib.request.Request(
        SS_BATCH_API,
        data=payload,
        headers={'Content-Type': 'application/json', 'User-Agent': 'CitationBot/1.0'}
    )

    try:
        with urllib.request.urlopen(req) as response:
            results = json.loads(response.read().decode('utf-8'))
            print(results)
    except Exception as e:
        print(f"Failed to fetch from Semantic Scholar: {e}")
        return

    # Map results back to publications
    id_to_count = {}
    for req_id, data in zip(paper_ids, results):
        if data and isinstance(data.get('citationCount'), int):
            id_to_count[req_id] = data['citationCount']

    updated_count = 0
    for pub in publications:
        pid = pub.get('paperId')
        if pid in id_to_count:
            new_citations = id_to_count[pid]
            if pub.get('citations') != new_citations:
                pub['citations'] = new_citations
                updated_count += 1
                print(f"Updated '{pub.get('title')[:30]}...' -> {new_citations} citations")

    if updated_count > 0:
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(publications, f, indent=2, ensure_ascii=False)
        print(f"Successfully updated {updated_count} publication citation counts.")
    else:
        print("No citation counts changed.")

if __name__ == '__main__':
    main()