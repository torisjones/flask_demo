class CustomerAccountsPage extends HTMLElement {
  constructor(){
    super();
    this._shadowRoot = this.attachShadow({mode: 'open'});
  }
  connectedCallback(){
    this._shadowRoot.innerHTML = tempHtml;
    this.backButton = this._shadowRoot.querySelector('#back');
    this.accountsDiv = this._shadowRoot.querySelector('#accounts');
    this.customerButton = this._shadowRoot.querySelector('#customers');
    this.createAccountDiv = this._shadowRoot.querySelector('#createAccountDiv');
    this.createAccountButton = this._shadowRoot.querySelector('#createAccount');
    this.manageAccountsDiv = this._shadowRoot.querySelector('#manageAccounts');
    this.__addEventListeners();
  }
  disconnectedCallback(){

  }
  attributeChangedCallback(){

  }
  adoptedCallback(){

  }
  __addEventListeners(){
    this.backButton.addEventListener('click',this.back.bind(this));
    this.customerButton.addEventListener('click',this.manageCustomers.bind(this));
    this.createAccountButton.addEventListener('click',this.__viewCreateAccount.bind(this));
  }
  get accounts() {
    return this._accounts;
  }
  set accounts(_value){
    this._accounts = _value;
    this.loadData();
  }
  get customerId() {
    return this._customerId;
  }
  set customerId(_value){
    this._customerId = _value;
  }
  loadData(){
    this.accounts.forEach((account)=>{
      let accountContainer = document.createElement('div');
      accountContainer.setAttribute('class','container');
      accountContainer.innerHTML = `<div class="horizontal-div"><div class="label">Nickname:</div>
        <div class='name'><input data="${account._id}" value="${account.nickname}" /></div></div>
        <div class="horizontal-div"><div class="label">Type:</div><div class="type">${account.type}</div></div>
        <div class="horizontal-div"><div class="label">Rewards:</div><div class="rewards">${account.rewards}</div></div>
        <div class="horizontal-div"><div class="label">Balance:</div><div class="balance">${account.balance}</div></div>
        <button id="${account._id}" class="save-button">Update Account Name</button>
        <button id="${account._id}" class="delete-button">Delete Account</button>`;
      this.accountsDiv.appendChild(accountContainer);
    });
    this.accountsDiv.querySelectorAll('.save-button').forEach((button)=>{
      button.addEventListener('click',this.__emitUpdateEvent.bind(this));
    });
    this.accountsDiv.querySelectorAll('.delete-button').forEach((button)=>{
      button.addEventListener('click',this.__emitRemoveEvent.bind(this));
    });
    if(this.accounts.length === 0){
      this.accountsDiv.innerHTML = 'No accounts yet.';
    }
  }
  __viewCreateAccount(){
    this.manageAccountsDiv.setAttribute('class','hidden');
    this.createAccountDiv.removeAttribute('class');
  }
  back(){
    this.dispatchEvent(new CustomEvent('back'));
  }
  manageCustomers(){
    this.dispatchEvent(new CustomEvent('customers'));
  }
  __emitUpdateEvent(event){
    let id = event.currentTarget.getAttribute('id');
    let nickname = this.accountsDiv.querySelector(`input[data="${id}"]`).value;
    this.dispatchEvent(new CustomEvent('update-account',{detail:{type:'update',id:id, nickname:nickname}}));
  }
  __emitRemoveEvent(event){
    let id = event.currentTarget.getAttribute('id');
    this.dispatchEvent(new CustomEvent('update-account',{detail:{type:'remove',id:id}}));
  }
}
if(!customElements.get('customer-accounts-page')){
  customElements.define('customer-accounts-page', CustomerAccountsPage);
}
