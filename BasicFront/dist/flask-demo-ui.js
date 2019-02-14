class FlaskDemoRoute extends HTMLElement {
  constructor(){
    super();
    this._shadowRoot = this.attachShadow({mode: 'open'});
  }
  connectedCallback(){
    this._shadowRoot.innerHTML = `<style></style><h1>Nessie Flask Route!</h1><div id="pageDiv"><button id="newCustomer">New Customer</button></div>`;
    this.createCustomerButton = this._shadowRoot.querySelector('#newCustomer');
    this.pageDiv = this._shadowRoot.querySelector('#pageDiv');
    this.__addEventListeners();
  }
  disconnectedCallback(){

  }
  attributeChangedCallback(){

  }
  adoptedCallback(){

  }
  __addEventListeners(){
    this.createCustomerButton.addEventListener('click',this.__createCustomer.bind(this));
  }
  __createCustomer(){
    this.pageDiv.innerHTML = '<nessie-flask-create-customer-page></nessie-flask-create-customer-page>';
  }
}
if(!customElements.get('flask-demo-route')){
  customElements.define('flask-demo-route', FlaskDemoRoute);
}
