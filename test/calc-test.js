

buster.testCase("Ellipsis#calc()", {
  setUp: function(done) {
    helpers.injectElement(this, done);
  },

  "Should correctly identify the overflowing child (single column)": function() {
    var ellip = new Ellipsis(this.el);

    this.el.className += ' container-1';
    this.el.style.height = '190px';
    this.el.style.width = '400px';

    ellip.calc();

    assert.equals(ellip.child.el, this.el.children[2]);
  },

  "Should correctly identify the overflowing child (double column)": function() {
    var ellip = new Ellipsis(this.el);

    this.el.className += ' container-2';
    this.el.style.height = '200px';
    this.el.style.width = '400px';

    ellip.calc();

    assert.equals(ellip.child.el, this.el.children[2]);
  },

  "Should correctly identify the overflowing child (triple column)": function() {
    var ellip = new Ellipsis(this.el);

    this.el.className += ' container-3';
    this.el.style.height = '200px';
    this.el.style.width = '400px';

    ellip.calc();

    assert.equals(ellip.child.el, this.el.children[2]);
  },

  "Should set zero height (collapsed) if there is not enought room for one line.": function() {
    var ellip = new Ellipsis(this.el);

    this.el.className += ' container-3';
    this.el.style.height = '10px';

    ellip.calc();

    assert.equals(ellip.child.clampedHeight, 0);
  },

  "Should not have set an overflowing child if there is enough room for all the content": function() {
    var ellip = new Ellipsis(this.el);

    this.el.className += ' container-2';
    this.el.style.width = '820px';
    this.el.style.height = '600px';

    ellip.calc().set();

    refute.defined(ellip.child.el);
  },

  "Should calculate correct height (check 1)": function() {
    var ellip = new Ellipsis(this.el);

    this.el.className += ' container-3';
    this.el.style.height = '105px';

    ellip.calc();

    assert.equals(ellip.child.clampedHeight, 310);
  },


  "Should calculate correct height (check 2)": function() {
    var ellip = new Ellipsis(this.el);

    this.el.className += ' container-2';
    this.el.style.width = '820px';
    this.el.style.height = '100px';

    ellip.calc();

    assert.equals(ellip.child.clampedHeight, 40);
  },

  "Should calculate correct height (check 3)": function() {
    var ellip = new Ellipsis(this.el);

    this.el.className += ' container-2';
    this.el.style.width = '820px';
    this.el.style.height = '20px';

    ellip.calc();

    assert.equals(ellip.child.clampedHeight, 40);
  },

  tearDown: function(done) {
    helpers.destroyElement(this.el, done);
  }
});