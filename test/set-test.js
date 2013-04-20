

buster.testCase("Ellipsis#set()", {
  setUp: function(done) {
    helpers.injectElement(this, done);
  },

  "The overflowing child must have its height set": function() {
    var ellip = new Ellipsis(this.el);

    this.el.className += ' container-1';

    ellip
      .calc()
      .set();

    assert.equals(ellip.child.el.style.height, ellip.child.clampedHeight + 'px');
  },

  "All elements after the overflowing child should be hidden": function() {
    var ellip = new Ellipsis(this.el);

    this.el.className += ' container-1';

    ellip
      .calc()
      .set();

    assert.equals(this.el.children[3].style.display, 'none');
    assert.equals(this.el.children[4].style.display, 'none');
  },

  "If a container is specified it should be marked after ellipsis has been set": function() {
    this.ellip = new Ellipsis(this.el, { container: document.body });

    this.el.className += ' container-1';

    this.ellip
      .calc()
      .set();

    assert(document.body.classList.contains('ellipsis-set'));
  },


  "Should appear completely collapsed if there is not enough room for one line": function() {
    this.ellip = new Ellipsis(this.el);

    this.el.className += ' container-3';
    this.el.style.height = '10px';

    this.ellip
      .calc()
      .set();

    assert.equals(this.ellip.child.el.style.overflow, 'hidden');
    assert.equals(this.ellip.child.el.clientHeight, 0);
  },

  "Should not not clamp any child element if there is enough room for all the content": function() {
    this.ellip = new Ellipsis(this.el);

    this.el.className += ' container-2';
    this.el.style.width = '820px';
    this.el.style.height = '600px';

    this.ellip.calc().set();

    var clampedEl = this.el.querySelector('.ellipsis-overflowing-child');

    assert.equals(clampedEl, null);
  },

  tearDown: function(done) {
    if (this.ellip) this.ellip.unset().destroy();
    helpers.destroyElement(this.el, done);
  }
});