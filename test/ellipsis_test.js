/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function() {

	/*
		======== A Handy Little QUnit Reference ========
		http://docs.jquery.com/QUnit

		Test methods:
			expect(numAssertions)
			stop(increment)
			start(decrement)
		Test assertions:
			ok(value, [message])
			equal(actual, expected, [message])
			notEqual(actual, expected, [message])
			deepEqual(actual, expected, [message])
			notDeepEqual(actual, expected, [message])
			strictEqual(actual, expected, [message])
			notStrictEqual(actual, expected, [message])
			raises(block, [expected], [message])
	*/

	module('Two column test', {
		setup: function() {
			var el = document.querySelector('.container');
			this.ellipsis = new Ellipsis(el);
		}
	});

	test('should be defined', function() {
		this.ellipsis.set();
		ok(this.ellipsis, 'Ellipsis is defined');
		this.ellipsis.unset();
		ok(!this.ellipsis.overflowingChild, 'overflowingChild is unset');
		this.ellipsis.destroy();
		ok(!this.ellipsis.el, '.el is null');
		ok(!this.ellipsis.overflowingChild, '.overflowingChild is null');
	});
}());
