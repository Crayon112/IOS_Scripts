def write(gallery, path):
    gallery = '\n\t},\n\t{\n\t\t'.join([f'{g}' for g in gallery])
    pattern = f'''
{{
    "name": "Crayon112",
    "task": [
    {{
        {gallery}
    }}
    ],
    "description": "Scripts Gallery"
}}
  '''
  
    with open(path, 'w') as f:
        f.write(pattern)

def read_gallery(path):
    with open(path, 'r') as f:
        lines = f.readlines()
        lines = [line.strip() for line in lines]
        lines = [line if line.find('config') != -1 else "" for line in lines]
        lines = list(set(lines))
        lines.remove("")
        lines.sort()
        return lines

if __name__ == "__main__":
    path = '.\gallery.json'
    gallery = read_gallery(path)
    write(gallery, path)
