export default Ember.Helper.helper(function([text, termToHighlight]) {

	let ret = Ember.String.htmlSafe(String(text).replace(new RegExp(termToHighlight, 'i'), '<strong>$&</strong>')); // Warning. This is not XSS safe!
	return ret;
});
