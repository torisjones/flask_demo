import {NessieApi} from "../utils/nessie-api";

class FlaskDemoRoute extends HTMLElement {
  constructor() {
    // If you define a constructor, always call super() first!
    // This is specific to CE and required by the spec.
    super();
    // This just gives you access to the shadowRoot for <flask-demo-route></flask-demo-route>
    this._shadowRoot = this.attachShadow({mode: 'open'});
    // Set this.api (used to make the HTTP requests) to a new instance of NessieApi. The NessieApi class can be found at
    // /utils/nessie-api
    this.api = new NessieApi();
  }
  // Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources
  // or rendering. Generally, you should try to delay work until this time.
  connectedCallback() {
    this._shadowRoot.innerHTML = `<style>button{padding:10px;margin:10px;border-radius:5px;width:150px}.create{background-color:seagreen;color:white}.manage{background-color:midnightblue;color:white}.regressive{background-color:darkred;color:white}.neutral-button{background-color:dimgrey;color:white}#pageDiv{font-family:sans-serif}h1{font-family:sans-serif}.error{color:darkred}
</style><h1>Nessie Flask!</h1><div class="error"></div><div id="pageDiv"></div>`;

    // Once the page builds, we initialize the html elements in flask-demo-route.html so that we can readily manipulate
    // their attributes/properties
    this.pageDiv = this._shadowRoot.querySelector('#pageDiv');
    this.errorDiv = this._shadowRoot.querySelector('.error');

    // Gets the customers from flask and displays the results
    this.__getCustomers();
  }
  // Called every time the element is removed from the DOM. Useful for running clean up code.
  disconnectedCallback() {

  }
  // Called when an observed attribute has been added, removed, updated, or replaced. Also called for initial values
  // when an element is created by the parser, or upgraded. Note: only attributes listed in the observedAttributes
  // property will receive this callback.
  attributeChangedCallback() {

  }
  adoptedCallback() {

  }
  __addEventListeners() {
  }
  
  //--------------------------------------------------------------------------------------------------------------------
  // api calls ---------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  // Customer endpoints
  __getCustomers() {
    this.api.getCall('/customers').then((data) => {
      this.customerList = data;
      this.__loadManageCustomersPage();
    }).catch((error) => {
      console.log(error);
      this.errorDiv.innerHTML = JSON.stringify(error);
    });
  }
  __getCustomerById(id) {
    this.api.getCall(`/customers/${id}`).then((data) => {
      this.__loadCreateCustomerPage(data);
    }).catch((error) => {
      console.log(error);
      this.errorDiv.innerHTML = JSON.stringify(error);
    });
  }
  __updateCustomer(event) {
    if(event.detail._id) {
      this.api.putCall(`/customers/${event.detail._id}`,event.detail).then(() => {
        this.__getCustomers();
      }).catch((error) => {
        console.log(error);
        this.errorDiv.innerHTML = JSON.stringify(error);
      })
    } else {
      this.api.postCall('/customers',event.detail).then(() => {
        this.__getCustomers();
      }).catch((error) => {
        console.log(error);
        this.errorDiv.innerHTML = JSON.stringify(error);
      });
    }
  }
  
  // Account Endpoints
  __getAccounts(id) {
    this.__loadAccountsPage();
    this.api.getCall(`/customers/${id}/accounts`).then((data) => {
      this.__loadAccountsPage(data,id);
    }).catch((error) => {
      console.log(error);
      this.errorDiv.innerHTML = JSON.stringify(error);
    });
  }
  __updateAccount(event) {
    let acctId = event.detail.acctId;
    let custId = event.detail.custId;
    let body = event.detail.body;
    switch(event.detail.type) {
      case 'update':
        this.api.putCall(`/accounts/${acctId}`,{nickname:body})
          .catch((error) => {
            console.log(error);
            this.errorDiv.innerHTML = JSON.stringify(error.statusText);
          });
        break;
      case 'remove':
        this.api.deleteCall(`/accounts/${acctId}`).then(() => {
          this.__getAccounts(custId);
        }).catch((error) => {
          console.log(error);
          this.errorDiv.innerHTML = JSON.stringify(error);
          this.__getAccounts(custId);
        });
        break;
      case 'create':
        this.api.postCall(`/customers/${custId}/accounts`,body).then(() => {
          this.__getAccounts(custId);
        }).catch((error) => {
          console.log(error);
          this.errorDiv.innerHTML = JSON.stringify(error.statusText);
        });
        break;
    }
  }

  //--------------------------------------------------------------------------------------------------------------------
  // routing functions -------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  __loadCreateCustomerPage(customer) {
    // Set the innerHTML of the pageDiv to the web component CreateCustomer
    this.pageDiv.innerHTML = '<create-customer></create-customer>';
    // Clear any errors that were on the page as we navigate to a "new" page (not really though because this is a
    // pseudo router, but it will look like a new page to the user)
    this.errorDiv.innerHTML = '';
    // Set the data property of the CreateCustomer web component
    // This is one way to pass data from a parent element to one of it's children. You can also set an attribute on the
    // child and then use a static get observedAttributes to watch for a change to the attribute. In this instance that
    // would look like
    /*
       this.pageDiv.querySelector('create-customer').setAttribute('data', JSON.stringify(customer));
    */
    // And then in the child, you would have to add the following function, typically above the constructor in the 
    // child's js
    /*
       static get observedAttributes() {
         return ['data'];
       }
     */
    // ^ the above would trigger the child's __attributeChangedCallback(){} whenever the data attribute is changed. So
    // if there was anything that you need to do once the data is set, you would add it in the __attributeChangedCallback.
    // Typically you would use a property if your data is not a string, as attributes can *only* be strings
    // Additionally, if you want your data to be a little more secure and not visible from inspecting the HTML, then
    // you would use property over attribute. In the instance that your data is both, not sensitive and a string, then
    // you would reflect your property to the attribute. I'll explain that more later
    this.pageDiv.querySelector('create-customer').data = customer;
    // Here we are adding an event listener to the child element CreateCustomer. An event listener is kind of like a 
    // baby monitor. In this analogy, the parent element and child elements are two different rooms. The event listener 
    // (baby monitor) is in the parent element and notifies the parent when an event (like a crying baby) is dispatched 
    // in the child element.
    // So in this instance, the parent element (flask-demo-route), is listening for a 'back' event to be dispatched from 
    // the child element (create customer) and then binding that event to __getCustomers(). Which just means that when 
    // the parent hears 'back', it will call __getCustomers();
    this.pageDiv.querySelector('create-customer').addEventListener('back',this.__getCustomers.bind(this));
    // We are again adding an event listener to the child element. This is very similar to the above situation, but if 
    // you compare the two functions triggered by the event listeners, you can see that __getCustomers() does not take 
    // in any parameters whereas __updateCustomer(event) takes in the parameter 'event'. By binding the functions to the 
    // dispatched events, you actually have access to the event that triggered the function. This is a good way to pass 
    // data from child to parent, typically you send the data you intend to access in the detail of the event, so it is 
    // accessed via event.detail -> we'll get more into that in the manageCustomersCall(event) function
    this.pageDiv.querySelector('create-customer').addEventListener('create-customer',this.__updateCustomer.bind(this));
  }
  __loadManageCustomersPage() {
    // Set the page to the ManageCustomers web component
    this.pageDiv.innerHTML = '<manage-customers></manage-customers>';
    // Clear any errors that were on the page as we navigate to a "new" page (not really though because this is a
    // pseudo router, but it will look like a new page to the user)
    this.errorDiv.innerHTML = '';
    // Set the 'customers' property to the list of customers returned from the get call to /customers
    this.pageDiv.querySelector('manage-customers').customers = this.customerList;
    // Bind manageCustomersCall(event) to the event 'manage-customers'
    this.pageDiv.querySelector('manage-customers').addEventListener('manage-customers',this.manageCustomersCall.bind(this));
  }
  manageCustomersCall(event) {
    // We will be utilizing the event dispatched from the child element to determine what kind of call we need to make.
    // In the child element (ManageCustomers), we set the detail of the event to contain the type of event and the
    // customer id (when necessary). So then to access this data, we just have to navigate to event.detail.type or
    // event.detail.id
    switch (event.detail.type) {
      case 'edit':
        // We emit the 'edit' type when we want to edit customer details, so first we need to get the customer details
        this.__getCustomerById(event.detail.id);
        break;
      case 'accounts':
        // We emit 'accounts' when we want to manage the customer's accounts, so first we must get the accounts belonging
        // to that customer
        this.__getAccounts(event.detail.id);
        break;
      case 'create':
        // We emit 'create' when we want to add a new customer, so we need to load in the create customer page
        this.__loadCreateCustomerPage();
        break;
    }
  }
  __loadAccountsPage(accounts,customerId) {
    // Set the page to the CustomerAccountsPage web component
    this.pageDiv.innerHTML = '<customer-accounts-page></customer-accounts-page>';
    // Clear any errors that were on the page as we navigate to a "new" page (not really though because this is a
    // pseudo router, but it will look like a new page to the user)
    this.errorDiv.innerHTML = '';
    // Set the 'accounts' property for CustomerAccountsPage to the accounts returned from get /customers/{id}/accounts
    this.pageDiv.querySelector('customer-accounts-page').accounts = accounts;
    // Set the 'customerId' property for CustomerAccountsPage to the id associated with the desired customer
    this.pageDiv.querySelector('customer-accounts-page').customerId = customerId;
    // Bind the 'update-account' event from child to __updateAccount(event)
    this.pageDiv.querySelector('customer-accounts-page').addEventListener('update-account',this.__updateAccount.bind(this));
    // Bind the 'customers' event to __getCustomers()
    this.pageDiv.querySelector('customer-accounts-page').addEventListener('customers',this.__getCustomers.bind(this));
  }
}
// This is where you actually define your web component and tie the js class to the html file - which makes the HTML tag
// work. In this case, <flask-demo-route></flask-demo-route>
if(!customElements.get('flask-demo-route')) {
  customElements.define('flask-demo-route', FlaskDemoRoute);
}
