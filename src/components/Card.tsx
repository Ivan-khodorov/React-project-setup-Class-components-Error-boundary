import { Component } from 'react';
import type { Item } from '../types';

interface CardProps {
  item: Item;
}

export class Card extends Component<CardProps> {
  render() {
    return (
      <article>
        <h2>{this.props.item.name}</h2>
        <p>{this.props.item.description}</p>
      </article>
    );
  }
}
