module.exports.isDate = function(s){
	if(s == null || s.trim() == ''){
		return false;
	}
	let d = new Date(s);
	if(d == 'Invalid Date'){
		return false;
	}
	return true;
}

module.exports.getListOfEvents = async function(list, query, schema){
	let returnList = [];
	if(list == null){
		return [];
	}
	for(let i=0;i<list.length;i++){
		query._id = list[i];
		await schema.findOne(query, (err, evt)=>{
			returnList.push(evt);
		});
	}
	return returnList;
}

module.exports.deleteDocument = async function(query, schema){
	//prevent deleting all
	if(query == {} || query==null){
		return;
	}

	schema.deleteOne(query, err=>{
		if(err){
			console.log(err);
			return;
		}
	});

}