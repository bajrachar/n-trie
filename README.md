# n-trie
A simple Trie data structure module for node. It can be used to populate a dictionary and do a quick lookup/suggestions in a type ahead auto complete for example.

##Installation
Use npm install as follows

```javascript
npm install -g n-trie
```
##Usage
n-trie command can be run at the command line as follows

```javascript
n-trie export.csv trie.json
```
where export.csv is a key-value pair of data to be loaded into trie delimited by ';'

trie.json will be the output in the form of json.