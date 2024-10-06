import { Model } from './model/model';

export class Presenter {
  constructor(view) {
    this.view = view;
    this.model = new Model();
  }

  initialize() {
    const data = this.model.getData();
    this.view.render(data);
  }
}