// PageManager: centraliza a criação e acesso às Page Objects e helpers.
// Use para obter instâncias compartilhadas de páginas (ex: HomePage) sem instanciá-las no teste.
import { Page } from '@playwright/test';
import { HomePage } from '../home.page';
import { Actions } from './Actions';

export class PageManager {
    private readonly page: Page;
    private _home?: HomePage;
    private _actions?: Actions;

    constructor(page: Page) {
        this.page = page;
    }

    // Retorna singleton lazy da HomePage
    get home(): HomePage {
        if (!this._home) this._home = new HomePage(this.page);
        return this._home;
    }

    // Retorna singleton lazy de Actions
    get actions(): Actions {
        if (!this._actions) this._actions = new Actions(this.page);
        return this._actions;
    }
}