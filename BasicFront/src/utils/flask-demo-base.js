
    import { debounce } from './debounce.js';
    import { selectAll } from './selectAll.js';
    import { coerceBooleanValue } from './coerceBooleanValue.js';
    
    export class Flask-demoBase extends HTMLElement {
      /**
       * Set initial value for boundAttributes
       * to bind attributes and properties together
       */
      static get boundAttributes() {
        return [];
      }
    
      /** Set default observed attributes to include boundAttributes */
      static get observedAttributes() {
        return [...this.boundAttributes];
      }
    
      /** Specify boolean attributes */
      static get booleanAttributes() {
        return [];
      }
    
      /**
       * @param {boolean} shadowRoot - Attach shadowRoot
       */
      constructor(shadowRoot = false) {
        super();
    
        if (shadowRoot) {
          this.attachShadow({ mode: 'open' });
        }
    
        /** Additional actions during boundAttribute setters */
        this.updatedCallbacks = new Map();
    
        /** Bind bound attribute keys to element properties */
        this.constructor.boundAttributes.forEach(attribute => {
          Object.defineProperty(this, attribute, {
            get: () => {
              const value = this.getAttribute(attribute);
              if (this.constructor.booleanAttributes.includes(attribute)) {
                if (!value) {
                  return false;
                } else {
                  return true;
                }
              }
              return value;
            },
            set: value => {
              if (this.constructor.booleanAttributes.includes(attribute)) {
                if (value || value === '') {
                  this.setAttribute(attribute, true);
                } else {
                  this.removeAttribute(attribute);
                }
              } else {
                if (value) {
                  this.setAttribute(attribute, value);
                } else {
                  this.removeAttribute(attribute);
                }
              }
    
              /**
               * If an updated callback exists for this attribute,
               * call it from this call site
               */
              const updatedCallback = this.updatedCallbacks.get(attribute);
              if (updatedCallback && typeof updatedCallback === 'function') {
                Reflect.apply(updatedCallback, this, [value, attribute]);
              }
            }
          });
        });
    
        /** Listeners */
        this._listeners = new Map();
    
        /** Refs */
        this.refs = new Map();
    
        /** Ensure updated callbacks are only called once per update */
        Promise.resolve().then(() => {
          this.updatedCallbacks.forEach((callback, key) => {
            this.updatedCallbacks.set(key, debounce(callback, 0, true));
          });
        });
      }
    
      /**
       * Attaches a click event handler if disabled is present. Ensures disabled components cannot emit click events
       * @return void
       */
      attachDisabledClickEventHandler() {
        if(this.constructor.observedAttributes.includes('disabled')) {
          this.on('click', (e) => {
            if (this.disabled) {
              e.stopImmediatePropagation();
            }
          });
        }
      }
    
      /**
       * Reinitialize property now that the component is `alive` so that it can receive the set values.
       * @param {string} prop
       */
      upgradeProperty(prop) {
        if(this.hasOwnProperty(prop)) {
          let value = this[prop];
          delete this[prop];
          this[prop] = value;
        }
    
      }
    
      /** Bind new attribute value to prop value for bound attributes */
      attributeChangedCallback(name, oldValue, newValue) {
        if (newValue !== oldValue && this.constructor.boundAttributes.includes(name)) {
          // coerce the string values from strings to booleans
          if (this.constructor.booleanAttributes.includes(name)) {
            newValue = coerceBooleanValue(newValue, name);
            oldValue = coerceBooleanValue(oldValue, name);
          }
    
          if (newValue !== '') {
            this[name] = newValue;
          } else if (newValue === '' && this.hasAttribute(name)) {
            this[name] = true;
          } else if (!this.hasAttribute(name)) {
            this[name] = null;
          }
        }
      }
    
      /**
       * Bind method to this instance
       * @param {string} methodName
       * @return void
       */
      bindMethod(methodName) {
        this[methodName] = this[methodName].bind(this);
      }
    
      /**
       * Set up bindings
       * @param {Array<string>} methods - method names to bind
       * @return void
       */
      bindMethods(methods = []) {
        methods.forEach(method => this[method] = this[method].bind(this));
      }
    
      /** Default connectedCallback */
      connectedCallback() {
        /** Save a reference to primary content as this.root */
        if (this.shadowRoot) {
          this.root = this.shadowRoot;
        } else {
          this.root = this;
        }
    
        this.render();
        this.upgradeProperties();
        this.connected();
        this.attachDisabledClickEventHandler();
    
      }
    
      /**
       * This is a webcomponents best practice.
       * It captures the value from the unupgraded instance and reinitializes the property so it does not shadow the custom element's own property setter.
       * This way, when the element's definition does finally load, it can immediately reflect the correct state.
       */
      upgradeProperties() {
        this.constructor.observedAttributes.forEach(prop => {
          if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            if (value) {
              this[prop] = value;
            }
          }
        });
      }
    
      /** Default disconnectedCallback */
      disconnectedCallback() {
        this._listeners.forEach((callback, eventName) =>
          this.removeEventListener(eventName, callback)
        );
        this.disconnected();
      }
    
      /**
       * Construct and dispatch a new CustomEvent
       * that is composed (traverses shadow boundary)
       * and that bubbles
       * @param {string} name - Event name to emit
       * @param {any} detail - The detail property of the CustomEvent
       * @return void
       */
      emitEvent(name, detail) {
        const customEvent = new CustomEvent(name, {
          detail,
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(customEvent);
      }
    
      /**
       * ES template tag used for parsing the
       * element's innerHTML. Use sparingly only
       * when you need a total rerender
       * @param {array<string>} strings
       * @param  {array<any>} values
       * @return void
       */
      html(strings, ...values) {
        const innerHTML = strings.map((string, index) =>
          `${string ? string : ''}${values[index] !== undefined ? values[index] : ''}`
        ).join('');
        this.root.innerHTML = innerHTML;
        selectAll(this.root, '[data-ref]')
          .forEach(ref => this.refs.set(ref.dataset.ref, ref));
        this.postRender();
      }
    
      /**
       * Perform an action on event bubbling to this
       * @param {string} eventName
       * @param {function} callback
       * @return void
       */
      on(eventName, callback, options) {
        this._listeners.set(eventName, callback);
        this.root.addEventListener(eventName, callback, options);
      }
    
      /**
       * Return any root element with [data-ref]
       * equal to the first argument
       * @param {string} ref
       * @return {HTMLElement}
       */
      ref(ref = '') {
        return this.root ? this.root.querySelector(`[data-ref="${ref}"]`) : null;
      }
    
      /** Default methods so we don't need checks */
      connected() { }
      disconnected() { }
      render() { }
      postRender() { }
    }
    