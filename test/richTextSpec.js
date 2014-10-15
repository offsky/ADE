/* ==================================================================
  Rich Text Editor Tests

-----------------------------------------------------------------*/

describe('Rich Text Editor', function() {

  beforeEach(function() {
    isAngularSite(true);
    browser.get('http://local.toodledo.com/ADE/app/rich/');
  });

  it('should render 2 controls', function() {
    expect(element.all(by.css('.ade-editme')).count()).toEqual(2);
  });

  it('should show a popup on click', function() {
    element(by.id('rich1')).click();
    expect(element.all(by.css('.ade-editme + .ade-popup')).count()).toEqual(1);
  });

  xit('should detect click outside to save edit', function() {
    element(by.id('rich1')).click();
    browser.sleep(2000);
    var e = element(by.css('.mce-tinymce .mce-edit-area'));//.getText();//.find('iframe').contents().find('body p').text('hi');
    // var e = $('.mce-tinymce');
    console.log(e);
    expect(e.getInnerHtml()).toEqual(1);
    // expect(e.getText()).toContain('click to edit');
    // expect(e.count()).toEqual(1);

    // myElement().richTextEnter('testing rich editor');
    // click on header
    element(by.css('h1')).click();
    // expect(element('.ade-editme:eq(0)').text()).toContain('testing rich editor');
  });

});
