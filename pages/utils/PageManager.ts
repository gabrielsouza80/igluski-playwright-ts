import { Page } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { SearchPage } from '../../pages/search.page';

export class PageManager {
    private readonly page: Page
    private readonly homePage: HomePage
    private readonly searchPage: SearchPage

    constructor(page: Page) {
        this.page = page
        this.homePage = new HomePage(page)
        this.searchPage = new SearchPage(page)
    }

    onHomePage(){
        return this.homePage;
    }

    onSearchPage(){
        return this.searchPage;
    }
}