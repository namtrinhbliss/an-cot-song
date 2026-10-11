import json,struct,re,pathlib,copy
out=pathlib.Path('output/models');out.mkdir(exist_ok=True)
def subset(source,target,match):
 b=pathlib.Path(source).read_bytes();n=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+n]);binstart=20+n;binsize=struct.unpack_from('<I',b,binstart)[0];binary=b[binstart+8:binstart+8+binsize]
 nodes=[copy.deepcopy(x) for x in j['nodes'] if 'mesh' in x and match(x['name'])]
 meshids=sorted(set(x['mesh'] for x in nodes));meshes=[copy.deepcopy(j['meshes'][i]) for i in meshids];mi={o:i for i,o in enumerate(meshids)}
 for x in nodes:x['mesh']=mi[x['mesh']]
 aids=set();vids=set();mids=set()
 for m in meshes:
  for p in m['primitives']:
   aids.update(p['attributes'].values())
   if 'indices'in p:aids.add(p['indices'])
   if 'material'in p:mids.add(p['material'])
   for ext in p.get('extensions',{}).values():
    if 'bufferView'in ext:vids.add(ext['bufferView'])
 aids=sorted(aids);amap={o:i for i,o in enumerate(aids)};acc=[copy.deepcopy(j['accessors'][i]) for i in aids]
 for a in acc:
  if 'bufferView'in a:vids.add(a['bufferView'])
  if 'sparse'in a:
   for k in ['indices','values']:vids.add(a['sparse'][k]['bufferView'])
 assert not j.get('images'),'Handle textures before using a textured input'
 mids=sorted(mids);mmap={o:i for i,o in enumerate(mids)}
 for m in meshes:
  for p in m['primitives']:
   p['attributes']={k:amap[v] for k,v in p['attributes'].items()}
   if 'indices'in p:p['indices']=amap[p['indices']]
   if 'material'in p:p['material']=mmap[p['material']]
 views=[];packed=bytearray();vmap={}
 for old in sorted(vids):
  v=copy.deepcopy(j['bufferViews'][old]);assert v['buffer']==0
  while len(packed)%4:packed.append(0)
  off=v.get('byteOffset',0);data=binary[off:off+v['byteLength']];v['byteOffset']=len(packed);packed.extend(data);vmap[old]=len(views);views.append(v)
 for a in acc:
  if 'bufferView'in a:a['bufferView']=vmap[a['bufferView']]
  if 'sparse'in a:
   for k in ['indices','values']:a['sparse'][k]['bufferView']=vmap[a['sparse'][k]['bufferView']]
 for m in meshes:
  for p in m['primitives']:
   for ext in p.get('extensions',{}).values():
    if 'bufferView'in ext:ext['bufferView']=vmap[ext['bufferView']]
 new={'asset':{'version':'2.0','generator':'An Cot Song subset tool','extras':{'source':'Z-Anatomy / BodyParts3D; GLB export JMK712/human-anatomy-online','license':'CC BY-SA 4.0','changes':'Selected anatomical meshes; compacted binary buffers; retained geometry and transforms'}},'scene':0,'scenes':[{'nodes':list(range(len(nodes)))}],'nodes':nodes,'meshes':meshes,'accessors':acc,'materials':[j['materials'][i] for i in mids],'bufferViews':views,'buffers':[{'byteLength':len(packed)}],'extensionsUsed':j.get('extensionsUsed',[]),'extensionsRequired':j.get('extensionsRequired',[])}
 jb=json.dumps(new,separators=(',',':')).encode();jb+=b' '*((-len(jb))%4);packed+=b'\0'*((-len(packed))%4)
 final=struct.pack('<III',0x46546c67,2,28+len(jb)+len(packed))+struct.pack('<II',len(jb),0x4e4f534a)+jb+struct.pack('<II',len(packed),0x004e4942)+packed
 (out/target).write_bytes(final);print(target,len(nodes),'meshes',len(final),'bytes')
 return new
spine=lambda name:bool(re.match(r'^(Vertebra [CTL]\d+|Atlas|Axis|Sacrum|Coccyx)',name))
subset('work/research/skeleton.glb','spine.glb',spine)
subset('work/research/skeleton.glb','neck.glb',lambda n:bool(re.match(r'^(Vertebra C\d+|Atlas|Axis|Scapula|Clavicle|Humerus|Radius|Ulna|Carpal|Metacarpal|Phalanx|.*(?:phalanx.*hand|metacarpal bone)|(?:Capitate|Hamate|Lunate|Pisiform|Scaphoid|Trapezium|Trapezoid|Triquetrum) bone)',n)))
subset('work/research/skeleton.glb','joints.glb',lambda n:bool(re.match(r'^(Vertebra L\d+|Sacrum|Coccyx|Scapula|Clavicle|Humerus|Radius|Ulna|Hip bone|Femur|Tibia|Fibula|Patella|.*(?:phalanx.*hand|metacarpal bone)|(?:Capitate|Hamate|Lunate|Pisiform|Scaphoid|Trapezium|Trapezoid|Triquetrum) bone)',n)))
subset('work/research/cardiovascular.glb','heart.glb',lambda n:bool(re.search(r'atrium|ventricle|atrioventricular|pulmonary trunk|ascending aorta|coronary artery',n,re.I)))

subset('work/research/skeleton.glb','body-context.glb',lambda n:bool(re.search(r'^(Parietal|Frontal|Occipital|Temporal|Sphenoid|Ethmoid|Maxilla|Zygomatic|Mandible|Nasal|Hip bone|Scapula|Clavicle|Humerus|Manubrium|Body of sternum|Xiphoid)|rib',n,re.I)))
