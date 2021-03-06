class CreateCustomer extends HTMLElement {
  constructor(){
    super();
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
    this._shadowRoot.innerHTML = `<style>.label{width:200px;padding-top:10px}button{padding:10px;margin:10px;border-radius:5px;width:150px}.create{background-color:seagreen;color:white}.manage{background-color:midnightblue;color:white}.regressive{background-color:darkred;color:white}.neutral-button{background-color:dimgrey;color:white}input{padding:5px;width:200px}
</style><h3>Customer DetailsPage!</h3><div class="label">First Name:</div><input id="firstName"/><br><div class="label">Last Name:</div><input id="lastName"/><br><div class="label">Street Number:</div><input id="streetNumber"/><br><div class="label">Street Name:</div><input id="streetName"/><br><div class="label">City:</div><input id="city"/><br><div class="label">State:</div><input id="state"/><br><div class="label">Zip:</div><input id="zip"/><br><div class="horizontal-div"><button id="back" class="neutral-button">Home</button><button id="create" class="create">Save</button></div>`;
    this.firstName = this._shadowRoot.querySelector('#firstName');
    this.lastName = this._shadowRoot.querySelector('#lastName');
    this.streetNumber = this._shadowRoot.querySelector('#streetNumber');
    this.streetName = this._shadowRoot.querySelector('#streetName');
    this.city = this._shadowRoot.querySelector('#city');
    this.state = this._shadowRoot.querySelector('#state');
    this.zip = this._shadowRoot.querySelector('#zip');
    this.backButton = this._shadowRoot.querySelector('#back');
    this.createButton = this._shadowRoot.querySelector('#create');
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
    this.backButton.addEventListener('click',this.back.bind(this));
    this.createButton.addEventListener('click',this.__emitUpdateEvent.bind(this));
  }
  get data() {
    return this._data;
  }
  set data(_value){
    this._data = _value;
    this.newCustomer = _value;
    this.loadData();
  }
  updateCustomer(event){
    if(this.newCustomer){
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
  loadData(){
    this.firstName.value = this.data.first_name;
    this.lastName.value = this.data.last_name;
    this.streetNumber.value = this.data.address.street_number;
    this.streetName.value = this.data.address.street_name;
    this.city.value = this.data.address.city;
    this.state.value = this.data.address.state;
    this.zip.value = this.data.address.zip;
  }
  back(){
    this.dispatchEvent(new CustomEvent('back'));
  }
  __emitUpdateEvent(){
    console.log('here');
    console.log(this.newCustomer);
    this.dispatchEvent(new CustomEvent('create-customer',{detail:this.newCustomer}));
  }
}
if(!customElements.get('create-customer')){
  customElements.define('create-customer', CreateCustomer);
}
