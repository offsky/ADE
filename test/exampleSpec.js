/* ==================================================================
  Sample Protractor Test

-----------------------------------------------------------------*/

describe('ADE', function() {
  it('should get home page', function() {
    isAngularSite(true);
    getHomepage();

    expect(element(by.id('text')).getText()).toEqual('click to edit me');
    element(by.model('datatext')).click();

    var input = element(by.css('.input-large'));
    input.clear();
    input.sendKeys('Hello');
    // blur
    element(by.css('h2')).click();

    // expect(element(by.model('datatext')).getAttribute('value')).toEqual('Hello');
    expect(element(by.id('text')).getText()).toEqual('Hello');

    // browser.sleep(1000);
  });
});
