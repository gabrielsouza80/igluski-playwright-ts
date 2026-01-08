// PageManager: centralizes the creation and access to Page Objects and helpers.
// Use to obtain shared instances of pages (e.g., HomePage) without instantiating them in the test.
import { Page } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { SearchPage } from '../../pages/search.page';
import { EnquirePage } from '../../pages/enquire.page';
import { AccommodationPage } from '../../pages/accomodation.page';
import { TravelOptionsPage } from '../../pages/travelOption.page';
import { ExtrasPage } from '../../pages/extras.page';
import { SummaryPage } from '../../pages/summary.page';
import { BookingDetailsPage } from '../../pages/bookingDetails.page';
import { PeopleAndContactDetailsPage } from '../../pages/people.page';
import { PaymentPage } from '../../pages/payment.page';
import { ComponentsPage } from "../../pages/components.page";
import { Actions } from '../utils/Actions';

export class PageManager {
    private readonly page: Page
    private readonly homePage: HomePage
    private readonly searchPage: SearchPage
    private readonly enquirePage: EnquirePage
    private readonly accommodationPage: AccommodationPage
    private readonly travelOptionsPage: TravelOptionsPage
    private readonly extrasPage: ExtrasPage
    private readonly summaryPage: SummaryPage
    private readonly bookingDetailsPage: BookingDetailsPage
    private readonly peopleAndContactDetailsPage: PeopleAndContactDetailsPage
    private readonly paymentPage: PaymentPage
    private readonly componentsPage: ComponentsPage

    private _actions?: Actions;

    constructor(page: Page) {
        this.page = page
        this.homePage = new HomePage(page)
        this.searchPage = new SearchPage(page)
        this.enquirePage = new EnquirePage(page)
        this.accommodationPage = new AccommodationPage(page)
        this.travelOptionsPage = new TravelOptionsPage(page)
        this.extrasPage = new ExtrasPage(page)
        this.summaryPage = new SummaryPage(page)
        this.bookingDetailsPage = new BookingDetailsPage(page)
        this.peopleAndContactDetailsPage = new PeopleAndContactDetailsPage(page)
        this.paymentPage = new PaymentPage(page)
        this.componentsPage = new ComponentsPage(page)
    }

    resetSoftIssues(): void {
        this.homePage.clearSoftIssues();
        this.searchPage.clearSoftIssues();
        this.enquirePage.clearSoftIssues();
        this.accommodationPage.clearSoftIssues();
        this.travelOptionsPage.clearSoftIssues();
        this.extrasPage.clearSoftIssues();
        this.summaryPage.clearSoftIssues();
        this.bookingDetailsPage.clearSoftIssues();
        this.peopleAndContactDetailsPage.clearSoftIssues();
        this.paymentPage.clearSoftIssues();
        this.componentsPage.clearSoftIssues();
    }

    collectSoftIssues(): { errors: string[]; warnings: string[] } {
        const pages = [
            this.homePage,
            this.searchPage,
            this.enquirePage,
            this.accommodationPage,
            this.travelOptionsPage,
            this.extrasPage,
            this.summaryPage,
            this.bookingDetailsPage,
            this.peopleAndContactDetailsPage,
            this.paymentPage,
            this.componentsPage,
        ];

        const errors = pages.flatMap(p => p.testCaseErrors || []);
        const warnings = pages.flatMap(p => p.testCaseWarnings || []);
        return { errors, warnings };
    }

    onHomePage() {
        return this.homePage;
    }

    onEnquirePage() {
        return this.enquirePage;
    }

    onSearchPage() {
        return this.searchPage;
    }

    onAccommodationPage() {
        return this.accommodationPage;
    }

    onTravelOptionsPage() {
        return this.travelOptionsPage;
    }

    onExtrasPage() {
        return this.extrasPage;
    }

    onSummaryPage() {
        return this.summaryPage;
    }

    onBookingDetailsPage() {
        return this.bookingDetailsPage;
    }

    onPeopleAndContactDetailsPage() {
        return this.peopleAndContactDetailsPage;
    }

    onPaymentPage() {
        return this.paymentPage;
    }

    onComponentsPage() {
        return this.componentsPage;
    }

    // Retorna singleton lazy de Actions
    get actions(): Actions {
        if (!this._actions) this._actions = new Actions(this.page);
        return this._actions;
    }
}