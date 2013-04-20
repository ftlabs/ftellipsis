

buster.testCase("Ellipsis#unset()", {
  setUp: function(done) {
    helpers.injectElement(this, done);
  },

  "Should restore the ellipsis element and it's contents back to how it was before .set()": function() {
    var ellip = new Ellipsis(this.el);
    var clamped = this.el.children[2];
    var naturalHeight = clamped.clientHeight;

    ellip
      .calc()
      .set();

    assert.equals(clamped.clientHeight, 20);

    ellip.unset();

    assert.equals(clamped.clientHeight, naturalHeight);
  },

  tearDown: function(done) {
    helpers.destroyElement(this.el, done);
  }
});