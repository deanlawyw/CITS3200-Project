import os
import time
import unittest
import pandas as pd
from selenium import webdriver
import selenium
from selenium.webdriver.common.keys import Keys
import subprocess


class Test(unittest.TestCase):

    base_url = "http://localhost:3000"

    def setUp(self) -> None:

        path = os.getcwd()
        # declare and initialize driver
        while True:
            driver_choice = input(
                "please select the webdriver, chrome or firefox: \n")
            if driver_choice.lower() == "chrome":
                self.driver = webdriver.Chrome(
                    os.path.join(path, "chromedriver"))
                break
            elif driver_choice.lower() == "firefox":
                self.driver = webdriver.Firefox(
                    os.path.join(path, "geckodriver"))
                break
        # subprocess.check_call("npm start", shell=True)

    def testSample(self) -> None:

        # browser loads in maximized window
        self.driver.maximize_window()

        # load a given url in browser window
        self.driver.get(self.base_url)
        time.sleep(5)

        # # fetech the content with xpath
        # content_list = self.driver.find_elements_by_xpath(
        #     "//h3/span[contains(text(),'')]/../..//table//td")
        # item_list = []

        # # collect the result in a dataframe
        # df = pd.DataFrame(item_list)

        # # find search box
        # search_box = self.driver.find_element_by_id("")
        # # enter the search term in the search textbox
        # search_box.send_keys(self.search_term)

        # # to search for the entered search term
        # search_box.send_keys(Keys.RETURN)
        # to click on the first search result's link
        pages = self.driver.find_elements_by_xpath(
            "//a[@class='px-4 py-2 m-0.5 hover:bg-blue-400 rounded font-sans text-white text-lg undefined']")
        # # switch to the new tab
        # self.driver.switch_to.window(self.driver.window_handles[1])
        # to confirm if a certain page has loaded
        for i in range(len(pages)):
            pages = self.driver.find_elements_by_xpath(
                "//a[@class='px-4 py-2 m-0.5 hover:bg-blue-400 rounded font-sans text-white text-lg undefined']")
            pages[i].click()
            time.sleep(5)
            # get back to the home page
            self.driver.execute_script("window.history.go(-1)")
            time.sleep(5)

        # # to confirm if a certain item is visible or not
        # self.assertTrue(self.driver.find_element_by_id("").is_displayed())

    def shutDown(self) -> None:

        self.driver.quit()


if __name__ == "__main__":
    test = Test()
    test.setUp()
    test.testSample()
