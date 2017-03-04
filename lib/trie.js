'use strict';

exports.trie = function(wordlist){
	var trie = {
		root: {}
	};

	trie.create = function(){

		for(var w in wordlist){
			var word = wordlist[w];
			addWord(word);
		}

		return trie;
	};

	trie.loadTrieJson = function(json){
		trie.root = JSON.parse(json);
	}

	/*
	* addWord - adds a new word to the Trie
	* @param {word} - word to add to the tree
	* @param {n} - frequency if applicable
	* @param {val} - Any value the trie should map to for this word as key.
	*/
	var addWord = trie.addWord = function(word, n, val){
		n = n || 0;
		word = word ? word.toLowerCase() : '';
		if(word.length > 0)
		{
			var cur = trie.root;
			for(var i = 0; i < word.length; i++){
				var letter = word[i], pos = cur[word[i]];

				if(pos == null) {
					cur = cur[letter] = i === word.length - 1 ? (val ? [n, val] : [n]) : {};
				} else if (is_array(pos)) {
						cur = cur[letter] = i < word.length - 1 ? {$:pos} : pos;
				} else {
					cur = cur[letter];

					if(i === word.length - 1)
						cur['$'] = val ? [n, val] : [n];
				}
			}
		}
	};

	trie.match = function(subText){
		var cur = trie.root;
		var pos, value, found = false;
		if(subText){
			var words = subText.toLowerCase();
			for(var c in words){
				pos = cur[words[c]];

				if(pos == null){
					pos = cur;
					found = false;
					break;
				} else if (is_array(pos) && c == words.length - 1){
					value = pos[1];
					found = true;
				} else if (pos['$'] && c == words.length - 1){
					value = pos['$'][1];
					found = true;
				}

				cur = pos;
			}
		}

		return value;
	}

	/*
	* suggest - return matches from the Trie based on the given string to match
	* @param {subText} - string to match
	* @param {ordered} - boolean to indicate if returned list should be ordered
	*/
	trie.suggest = function(subText, ordered){
		var cur = trie.root;
		var matched = '';
		var pos;
		var suggestions = [];
		var words = subText.toLowerCase();
		if(subText)	{
			for(var c in words)
			{
				pos = cur[words[c]];
				
				if(pos == null){
					pos = cur;
					break;
				}
				
				matched += words[c];
				cur = pos;
			}

			//Return all combinations of letters as suggestions
			if(matched !== '')
			{
				if(ordered){
					var list = getList(pos, matched);
					suggestions = list.sort(function(a,b){
						return -1 * (a.f - b.f);  // sort using frequency - highest first
					});
				}
				else
					suggestions = getList(pos, matched);
			}
		}
		
		return suggestions;
	};

	var getAllCombination = function(node, prefix){
		var list = [];
		for(var c in node)
		{
			if(is_array(node[c]) && c != '$')
				list.push(prefix+c);
			else{
				if(c == '$')
					list.push(prefix);
				else
					list = list.concat(getAllCombination(node[c], prefix+c));
			}
		}
		return list;
	};

	var getAllCombinationFreq = function(node, prefix){
		var list = [];
		for(var c in node)
		{
			if(is_array(node[c]) && c != '$')
				list.push({key: prefix+c, f: node[c][0]});
			else{
				if(c == '$')
					list.push({key: prefix, f: node[c][0]});
				else
					list = list.concat(getAllCombinationFreq(node[c], prefix+c));
			}
		}

		return list;
	};

	var mergeSingleChildNodes = trie.mergeSingleChildNodes = function(node, skipDepths, curDepth){
		var merged;
		curDepth = curDepth || 0;
		skipDepths = skipDepths || 0;
		if(!is_array(node)){
			for(var c in node)
			{
				if(is_array(node[c]) && c != '$')
				{
					if(Object.keys(node).length === 1)
						return c;
				}
				else
				{
					merged = mergeSingleChildNodes(node[c], skipDepths, curDepth + 1);
					if(curDepth > skipDepths && c != '$'){
						if(Object.keys(node[c]).length === 1)
						{
							node[c+merged] = node[c][merged];
							delete node[c];
						}
						
						if(Object.keys(node).length === 1)
							return c+merged;
					}
				}
			}
		}

		return '';
	};

	var getList = function(node, prefix){
		var list = [];

		if(!is_array(node)){
			var next = [{node: node, prefix: prefix}];

			while(next.length > 0)
			{
				var nextDepth = [];
				for(var n in next){
					for(var c in next[n].node)
					{
						if(is_array(next[n].node[c]) && c != '$')
							list.push({key: next[n].prefix+c, f: next[n].node[c][0], value: next[n].node[c][1]});
						else
						{
							if(c == '$')
								list.push({key: next[n].prefix, f: next[n].node[c][0], value: next[n].node[c][1]});
							else{
								nextDepth.push({node: next[n].node[c], prefix: next[n].prefix+c});
							}

						}
				
					}
				}
					
				next = nextDepth;
			}
		} else {
			list.push({key:prefix, f: node[0], value: node[1]});
		}
	}

	/*
	* Check if object is array.
	* Taken from Douglas Crockford - Javascript the good parts.
	*/
	var is_array = function(value){
		return value &&
			typeof value === 'object' &&
			value.constructor === Array;
	};

	return trie;
};