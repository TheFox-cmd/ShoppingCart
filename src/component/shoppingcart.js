import React, { Component } from "react";
import "./shoppingcart.css";
import {
  getCart,
  addToCart,
  updateCart,
  deleteFromCart,
  checkout
} from "../APIs/cartAPI";

import {
  getInventory
} from "../APIs/inventoryAPI";

export default class Shoppingcart extends Component {
  constructor(props) {
      super(props);
      this.state = {
        inventory: [],
        cart: []
      };
  }

  async componentDidMount() {
    try {
      const inventoryData = await getInventory();
      const cartData = await getCart();
      this.setState({ 
        inventory: inventoryData.map((item, _) => ({ ...item, count: 0 })),
        cart: cartData.map((item, _) => item)
      });
    } catch (e) {
      alert("Failed to update inventory\n" + e)
    }
  }

  handleDecrement = async(fruitID) => {
    if (fruitID !== null && fruitID - 1 < this.state.inventory.length && fruitID - 1 >= 0) {
      this.setState({
        ...this.state,
        inventory: this.state.inventory.map((fruit, _) => {
          const currFruit = this.state.inventory.find((item) => item.id === fruit.id)
          if (fruitID === currFruit.id && currFruit.count !== 0) return { ...fruit, count: --currFruit.count };
          else return fruit;
        }),
      });
    } else {
      console.log("Invalid fruitID")
    }
  }

  handleIncrement = async(fruitID) => {
    if (fruitID !== null && fruitID - 1 < this.state.inventory.length && fruitID - 1 >= 0) {
      this.setState({
        ...this.state,
        inventory: this.state.inventory.map((fruit, _) => {
          const currFruit = this.state.inventory.find((item) => item.id === fruit.id)
          if (fruitID === currFruit.id) return { ...fruit, count: ++currFruit.count };
          else return fruit;
        }),
      });
    } else {
      console.log("Invalid fruitID")
    }
  }

  handleAddCart = async(fruitID) => {
    if (fruitID !== null && fruitID - 1 < this.state.inventory.length && fruitID - 1 >= 0) {
      const cart = await getCart();
      const fruitCart = cart.find((fruit) => fruit.id === fruitID);
      const fruitInventory = this.state.inventory.find((fruit) => fruit.id === fruitID);
      if (fruitCart !== undefined) {
        const newFruit = {
          id: fruitCart.id,
          content: fruitCart.content,
          count: fruitCart.count + fruitInventory.count
        }
        await updateCart(newFruit.id, newFruit)
      } else if (fruitInventory.count !== 0) {
        await addToCart(fruitInventory);
      }

      const updatedCart = await getCart(); 
      this.setState({
        cart: updatedCart.map((item, _) => item)
      })
    }
  }

  handleDelete = async(fruitID) => {
    await deleteFromCart(fruitID)
    const updatedCart = await getCart();
    this.setState({
      cart: updatedCart.map((item, _) => item)
    })
  }

  handleCheckout = async() => {
    await checkout();
    const updatedCart = await getCart();
    this.setState({
      cart: updatedCart.map((item, _) => item)
    })
  }

  render () {
    return (
      <div id="app">
        <div className="inventory-container">
          <h1>Inventory</h1>
          <div className="fruit-container">
            {
              this.state.inventory.map((fruit, index) => {
                return (
                  <div className="format" key={index}>
                    <span>{fruit.content}</span>
                    <button className="decrement" onClick={() => this.handleDecrement(fruit.id)}>-</button>
                    <span className="count">{fruit.count}</span>
                    <button className="increment" onClick={() => this.handleIncrement(fruit.id)}>+</button>
                    <button className="toCart" onClick={() => this.handleAddCart(fruit.id)}>add to cart</button>
                  </div>
                )
              })
            }
          </div>
        </div>
        <div className="cart-container">
          <h1>Shopping Cart</h1>
          <div className="cart-wrapper">
            <div className="fruit-cart">
              {
                this.state.cart.map((fruit, index) => {
                  return (
                    <div className="format" key={index}>
                      <span>{fruit.content} x {fruit.count}</span>
                      <button className="del" onClick={() => this.handleDelete(fruit.id)}>delete</button> 
                    </div>
                  )
                })
              }
            </div>
            <button className="checkout-btn" onClick={() => this.handleCheckout()}>checkout</button>
          </div>
        </div>
      </div>
    )
  }
}