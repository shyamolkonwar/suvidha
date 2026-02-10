"""City Data Router - Weather, alerts, news ticker"""
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter
from app.models import WeatherData, NewsItem, CityDataResponse

router = APIRouter(prefix="/city-data", tags=["City Data"])


# Mock weather data
def _get_mock_weather() -> WeatherData:
    """Get mock weather data"""
    return WeatherData(
        temperature=32.5,
        humidity=65,
        condition="Partly Cloudy",
        feels_like=35.0,
        location="Guwahati, Assam"
    )


# Mock alerts and news
def _get_mock_alerts() -> List[NewsItem]:
    """Get mock city alerts"""
    return [
        NewsItem(
            id="alert-1",
            title="Scheduled Maintenance",
            content="Water supply will be interrupted in Sector 4-6 from 10 AM to 2 PM for pipeline maintenance.",
            priority="MEDIUM",
            category="MAINTENANCE",
            published_at=datetime.now()
        ),
        NewsItem(
            id="alert-2",
            title="Payment Due Reminder",
            content="Electricity bills for January 2024 are due. Please pay before the 25th to avoid late fees.",
            priority="LOW",
            category="BILLING",
            published_at=datetime.now() - timedelta(hours=6)
        ),
        NewsItem(
            id="alert-3",
            title="New Connection Camp",
            content="Special camp for new water connection applications at Municipal Office this Saturday.",
            priority="LOW",
            category="ANNOUNCEMENT",
            published_at=datetime.now() - timedelta(days=1)
        )
    ]


def _get_mock_news_ticker() -> List[str]:
    """Get mock news ticker headlines"""
    return [
        "Smart City Project Phase 2 inaugurated by Mayor",
        "Solar-powered street lights being installed in all wards",
        "24/7 water supply to begin in North Zone next month",
        "Property tax discount for early payment extended",
        "New grievance portal launched - complaints resolved 40% faster"
    ]


@router.get("/weather", response_model=WeatherData)
async def get_weather():
    """
    Get current weather data for the city
    """
    return _get_mock_weather()


@router.get("/alerts", response_model=List[NewsItem])
async def get_alerts():
    """
    Get active city alerts and announcements
    """
    return _get_mock_alerts()


@router.get("/news-ticker", response_model=List[str])
async def get_news_ticker():
    """
    Get news ticker headlines
    """
    return _get_mock_news_ticker()


@router.get("", response_model=CityDataResponse)
async def get_city_data():
    """
    Get all city data (weather, alerts, news ticker) in one call
    """
    return CityDataResponse(
        weather=_get_mock_weather(),
        alerts=_get_mock_alerts(),
        news_ticker=_get_mock_news_ticker()
    )
