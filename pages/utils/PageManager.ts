// PageManager: centraliza a criação e acesso às Page Objects e helpers.
// Use para obter instâncias compartilhadas de páginas (ex: HomePage) sem instanciá-las no teste.
import { Page } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { SearchPage } from '../../pages/search.page';
import { Actions } from '../utils/Actions';

export class PageManager {
    private readonly page: Page
    private readonly homePage: HomePage
    private readonly searchPage: SearchPage
    private _actions?: Actions;

    constructor(page: Page) {
        this.page = page
        this.homePage = new HomePage(page)
        this.searchPage = new SearchPage(page)
    }

    onHomePage() {
        return this.homePage;
    }

    onSearchPage() {
        return this.searchPage;
    }

    // Retorna singleton lazy de Actions
    get actions(): Actions {
        if (!this._actions) this._actions = new Actions(this.page);
        return this._actions;
    }
}