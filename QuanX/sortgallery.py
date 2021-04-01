def read_gallery(path):
  with open(path, 'r') as f:
    f = f.read()
    f = f.split('\n')
    # 去杂
    f = [_f.strip() if _f.find("config") != -1 else None for _f in f]
    # 去重
    f = list(set(f))
    # 去空
    f = f.remove(None)
    # 排序
    f.sort()
    return f

def write(gallery, path):
  gallery = ',\n'.join([f'\t\t\t{{{g}}}' for g in gallery])
  pattern = f'''
{
    "name": "Crayon112",
    "task": [
        {gallery}
    ],
    "description": "Scripts Gallery"
}
  '''
  with open(path, 'w') as f:
    f.write(pattern)

if __name__ == "__main__":
  path = '.\gallery.json'
  gallery = read_gallery(path)
  write(gallery, path)
