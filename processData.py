import csv
import json

def addNameToTree(root, nameData):
  current = root
  name = nameData["name"]
  for idx,n in enumerate(name):
    if(n not in current.keys()):
      current[n] = {}
    current = current[n]
    if(idx == len(name) - 1):
      yearCount = { nameData["year"]: nameData["count"] }
      if("_" in current.keys()):
        if(nameData["gender"] == "M"):
          current["_"]["c"][0][nameData["year"]] = nameData["count"]
        else:
          current["_"]["c"][1][nameData["year"]] = nameData["count"]
      else:
        if(nameData["gender"] == "M"):
          current["_"] = {"n": name, "c":[yearCount,{}]}
        else:
          current["_"] = {"n": name, "c":[{},yearCount]}


with open('name.txt', 'rb') as csvfile:
  reader = csv.reader(csvfile, delimiter=',')
  root = {}
  for row in reader:
    nameData = {"name": row[0], "gender": row[1], "count": row[2], "year": row[3] }
    addNameToTree(root, nameData)
    #print ', '.join(row)
  f = open('data1.json', 'w')
  f.write(json.dumps(root))
