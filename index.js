const API = (() => {
  const URL = "http://localhost:3000";
  const getCart = () => {
    // define your method to get cart data
    return fetch(`${URL}/cart`, {}).then((res) => res.json()); 
  };

  const getInventory = () => {
    // define your method to get inventory data
    return fetch(`${URL}/inventory`, {}).then((res) => res.json());
  };

  const addToCart = (inventoryItem) => {
    // define your method to add an item to cart
    return fetch(`${URL}/cart`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(inventoryItem)
    }).then((res) => res.json())
  };

  const updateCart = (id, item) => {
    // define your method to update an item in cart
    return fetch(`${URL}/cart/${id}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(item)
    }).then((res) => res.json())
  };

  const deleteFromCart = (id) => {
    // define your method to delete an item in cart
    return fetch(`${URL}/cart/${id}`,{
      method: "DELETE"
    }).then((res) => res.json())
  };

  const checkout = () => {
    // you don't need to add anything here
    return getCart().then((data) =>
      Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const Model = (() => {
  // implement your logic for Model
  class baseState {
    onChange; 
    data; 
    constructor(){}
    get getData(){return this.data}
    set setData(newData){this.data = newData; this.onChange(newData)}
    subscribe(cb){this.onChange = cb;}
  }
  
  class invState extends baseState {
    constructor() {
      super();
      this.data = [];
    }
  }

  class cartState extends baseState {
    constructor() {
      super();
      this.data = []
    }
  }

  const {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  } = API;
  return {
    invState,
    cartState,
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const View = (() => {
  // implement your logic for View
  const renderInventory = (fruitList) => {
    const fruitContainer = document.querySelector(".fruit-container");
    let renderList = "";
    for (let fruit of fruitList) {
      const fruitItem = `<div class="format">
        <span>${fruit.content}</span>
        <button class="dec${fruit.content} minus">-</button>
        <span class="cnt${fruit.content}">${fruit.count}</span>
        <button class="inc${fruit.content} add">+</button>
        <button class="cart${fruit.content} toCart">add to cart</button>
      </div>
      `
      renderList += fruitItem;
    }

    fruitContainer.innerHTML = renderList;
  }

  const renderCart = (fruitList) => {
    const fruitCart = document.querySelector(".fruit-cart");
    let renderList = "";
    for (let fruit of fruitList) {
      const cartItem = `<div class="format">
        <span>${fruit.content} x ${fruit.count}</span>
        <button class="del${fruit.content} del">delete</button> 
        </div>
      `
      renderList += cartItem;
    }
    fruitCart.innerHTML = renderList;
  }
  
  return {renderInventory, renderCart};
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const invState = new model.invState();
  const cartState = new model.cartState();

  const init = () => {
    window.onload = () => {
      model.getInventory().then((res) => {
          const spreadInventory = res.map((item) => ({...item, "count": 0}));
          invState.setData = spreadInventory;
          handleUpdateAmount();
        }
      );

      model.getCart().then((res) => {
        cartState.setData = res;
        handleAddToCart();
        handleDelete();
      })

      handleCheckout();
    };
    invState.subscribe(view.renderInventory);
    cartState.subscribe(view.renderCart);
  };
  
  const handleUpdateAmount = () => {
    for (let fruit of invState.getData) {
      const name = fruit.content
      const dec = document.querySelector(".dec" + name);
      const inc = document.querySelector(".inc" + name); 

      dec.addEventListener("click", (event) => {
        event.preventDefault();
        const newFruitList = [...invState.getData];
        for (let item of newFruitList) if (item.content === name && item.count > 0) --item.count;
        invState.setData = newFruitList;
        handleUpdateAmount();
        handleAddToCart();
      });

      inc.addEventListener("click", (event) => {
        event.preventDefault();
        const newFruitList = [...invState.getData];
        for (let item of newFruitList) if (item.content === name) ++item.count;
        invState.setData = newFruitList;
        handleUpdateAmount();
        handleAddToCart();
      });
    }
  };

  const handleAddToCart = () => {
    for (let fruit of invState.getData) {
      const name = fruit.content
      const cart = document.querySelector(".cart" + name);

      cart.addEventListener("click", (event) => {
        event.preventDefault();
        const fruitInventory = [...invState.getData];
        for (let item of fruitInventory) {
          if (item.content !== name || item.count === 0) continue;
          const fruitCart = [...cartState.getData]; 
          let flag = false;
          for (let cartItem of fruitCart) if (cartItem.content === item.content) flag = true; 
          if (!flag) {
            model.addToCart(item).then((res) => {
              const currentCart = cartState.getData;
              const newCart = [...currentCart, res];
              cartState.setData = newCart;
              handleDelete();
            });
            break;
          }
          for (let cartItem of fruitCart) {
            if (cartItem.content === item.content) {
              const newCartItem = {...cartItem, "count": item.count + cartItem.count}
              model.updateCart(cartItem.id, newCartItem).then((res) => {
                const currentCart = [...cartState.getData];
                for (let item of currentCart) if (item.content === res.content) item.count = res.count;
                cartState.setData = currentCart;
                handleDelete();
              });
            }
          }
        }
      });
    }
  };

  const handleDelete = () => {
    for (let fruit of cartState.getData) {
      const name = fruit.content
      const delItem = document.querySelector(".del" + name);
      delItem.addEventListener("click", (event) => {
        event.preventDefault();
        for (let fruit of cartState.getData){
          if (fruit.content !== name) continue;
          model.deleteFromCart(fruit.id).then(() => {
            const currentCart = [...cartState.getData];
            const newCart = []
            for (let item of currentCart) if (item.content !== fruit.content) newCart.push(item)
            cartState.setData = newCart;
            handleDelete();
          }) 
        }
      })
    };
  }

  const handleCheckout = () => {
    const checkout = document.querySelector(".checkout-btn");
    checkout.addEventListener("click", (event) => {
      event.preventDefault();
      model.checkout().then(() => {
        cartState.setData = [];
      })
    })
  };

  const bootstrap = () => {
    init();
  };
  
  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();

