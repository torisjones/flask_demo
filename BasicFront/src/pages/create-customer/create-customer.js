class CreateCustomer extends HTMLElement {
  constructor(){
    // If you define a constructor, always call super() first!
    // This is specific to CE and required by the spec.
    super();
    // This just gives you access to the shadowRoot for <create-customer></create-customer>
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this.newCustomer = {
      first_name: '',
      last_name: '',
      address: {
        street_number: '',
        street_name: '',
        city: '',
        state: '',
        zip: ''
      }
    }
  }
  connectedCallback(){
    this._shadowRoot.innerHTML = tempHtml;
    // Once the page builds, we initialize the html elements in create-customer.html so that we can readily manipulate
    // their attributes/properties
    this.firstName = this._shadowRoot.querySelector('#firstName');
    this.lastName = this._shadowRoot.querySelector('#lastName');
    this.streetNumber = this._shadowRoot.querySelector('#streetNumber');
    this.streetName = this._shadowRoot.querySelector('#streetName');
    this.city = this._shadowRoot.querySelector('#city');
    this.state = this._shadowRoot.querySelector('#state');
    this.zip = this._shadowRoot.querySelector('#zip');
    this.backButton = this._shadowRoot.querySelector('#back');
    this.createButton = this._shadowRoot.querySelector('#create');
    // Since these elements are interactive fields, typically you create a method called addEventListeners where you then
    // attach all respective listeners. So now CreateCustomer is the parent element and it will be listening for
    // change/click events for the inputs/buttons that are it's child elements
    this.__addEventListeners();
  }
  disconnectedCallback(){

  }
  attributeChangedCallback(){

  }
  adoptedCallback(){

  }
  __addEventListeners(){
    this.firstName.addEventListener('change',this.updateCustomer.bind(this));
    this.lastName.addEventListener('change',this.updateCustomer.bind(this));
    this.streetNumber.addEventListener('change',this.updateCustomer.bind(this));
    this.streetName.addEventListener('change',this.updateCustomer.bind(this));
    this.city.addEventListener('change',this.updateCustomer.bind(this));
    this.state.addEventListener('change',this.updateCustomer.bind(this));
    this.zip.addEventListener('change',this.updateCustomer.bind(this));
    this.backButton.addEventListener('click',this.__emitBackEvent.bind(this));
    this.createButton.addEventListener('click',this.__emitUpdateEvent.bind(this));
  }
  //--------------------------------------------------------------------------------------------------------------------
  // Getters and Setters -----------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  // This is how you get/set the properties for the web component. So when we did
  /*
      this.pageDiv.querySelector('create-customer').data = customer;
   */
  // in flask-demo-route.js, that data is set in the set data(_value) below and then accessed in the get data()
  // If you wanted to reflect the property to the attribute you would do something like this
  /*
      get data() {
        return this.getAttribute('data');
      }

      set data(_value) {
        this.setAttribute('data', _value);
      }
   */
  // Some properties reflect their values as attributes, meaning that if the property is changed using JavaScript, the
  // corresponding attribute is also changed at the same time to reflect the new value. This is useful for accessibility
  // and to allow CSS selectors to work as intended. If you are passing a JSON object, typically, you would not reflect
  // the property
  get data() {
    return this._data;
  }
  set data(_value){
    this._data = _value;
    if(_value){
      this.newCustomer = _value;
      this.loadData();
    }
  }
  //--------------------------------------------------------------------------------------------------------------------
  // Manage Data -------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  // Sets all the customer attributes to their corresponding inputs on the page
  loadData(){
    this.firstName.value = this.data.first_name;
    this.lastName.value = this.data.last_name;
    this.streetNumber.value = this.data.address.street_number;
    this.streetName.value = this.data.address.street_name;
    this.city.value = this.data.address.city;
    this.state.value = this.data.address.state;
    this.zip.value = this.data.address.zip;
  }
  // Updates this.newCustomer with the value of the input that changed
  updateCustomer(event){
    if(this.newCustomer){
      // event.currentTarget is very useful when interacting with a button, input, etc. CurrentTarget contains the HTML
      // element that triggered the event. So then you can access it's properties/attributes, which in this case, we
      // built a switch statement based on the attribute 'id' so we knew which field in this.newCustomer to update
      switch(event.currentTarget.getAttribute('id')){
        case 'firstName':
          this.newCustomer.first_name = event.currentTarget.value;
          break;
        case 'lastName':
          this.newCustomer.last_name = event.currentTarget.value;
          break;
        case 'streetNumber':
          this.newCustomer.address.street_number = event.currentTarget.value;
          break;
        case 'streetName':
          this.newCustomer.address.street_name = event.currentTarget.value;
          break;
        case 'city':
          this.newCustomer.address.city = event.currentTarget.value;
          break;
        case 'state':
          this.newCustomer.address.state = event.currentTarget.value;
          break;
        case 'zip':
          this.newCustomer.address.zip = event.currentTarget.value;
      }
    }
  }
  //--------------------------------------------------------------------------------------------------------------------
  // Dispatch Events ---------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  __emitBackEvent(){
    // Dispatch a 'back' event to the parent element (FlaskDemoRoute), will return to the manage-customers page
    this.dispatchEvent(new CustomEvent('back'));
  }
  __emitUpdateEvent(){
    // Similar to above, but we are instantiating a dictionary of data we want the parent element to be able to access.
    // Will post/put customer and return to the manage-customers page
    this.dispatchEvent(new CustomEvent('create-customer',{detail:this.newCustomer}));
  }
}
if(!customElements.get('create-customer')){
  customElements.define('create-customer', CreateCustomer);
}
