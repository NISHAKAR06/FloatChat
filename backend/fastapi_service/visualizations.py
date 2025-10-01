"""
Visualization generation for ARGO data using Matplotlib and Plotly.
Creates interactive plots and charts for oceanographic data analysis.
"""

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.colors import LinearSegmentedColormap
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import logging
import io
import base64
from pathlib import Path

logger = logging.getLogger(__name__)

class ArgoVisualizer:
    """Visualization generator for ARGO oceanographic data"""

    def __init__(self):
        # Custom colormap for ocean data
        self.ocean_colormap = LinearSegmentedColormap.from_list(
            'ocean', ['#1e3a8a', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
        )

        # Plotly template for ocean data
        self.ocean_template = {
            'layout': {
                'paper_bgcolor': 'rgba(0,0,0,0)',
                'plot_bgcolor': 'rgba(0,0,0,0)',
                'font': {'family': 'Arial, sans-serif', 'size': 12, 'color': '#1f2937'},
                'margin': {'l': 60, 'r': 60, 't': 80, 'b': 60}
            }
        }

    def create_temperature_profile_plot(self, profiles: List[Dict], output_format: str = 'plotly') -> str:
        """Create temperature vs depth profile plot"""
        try:
            if output_format == 'plotly':
                return self._create_temperature_profile_plotly(profiles)
            else:
                return self._create_temperature_profile_matplotlib(profiles)
        except Exception as e:
            logger.error(f"Error creating temperature profile plot: {e}")
            return ""

    def create_salinity_profile_plot(self, profiles: List[Dict], output_format: str = 'plotly') -> str:
        """Create salinity vs depth profile plot"""
        try:
            if output_format == 'plotly':
                return self._create_salinity_profile_plotly(profiles)
            else:
                return self._create_salinity_profile_matplotlib(profiles)
        except Exception as e:
            logger.error(f"Error creating salinity profile plot: {e}")
            return ""

    def create_ts_diagram(self, profiles: List[Dict], output_format: str = 'plotly') -> str:
        """Create Temperature-Salinity diagram"""
        try:
            if output_format == 'plotly':
                return self._create_ts_diagram_plotly(profiles)
            else:
                return self._create_ts_diagram_matplotlib(profiles)
        except Exception as e:
            logger.error(f"Error creating TS diagram: {e}")
            return ""

    def create_map_view(self, profiles: List[Dict], output_format: str = 'plotly') -> str:
        """Create geographic map view of profiles"""
        try:
            if output_format == 'plotly':
                return self._create_map_view_plotly(profiles)
            else:
                return self._create_map_view_matplotlib(profiles)
        except Exception as e:
            logger.error(f"Error creating map view: {e}")
            return ""

    def create_time_series_plot(self, profiles: List[Dict], output_format: str = 'plotly') -> str:
        """Create time series plot of surface measurements"""
        try:
            if output_format == 'plotly':
                return self._create_time_series_plotly(profiles)
            else:
                return self._create_time_series_matplotlib(profiles)
        except Exception as e:
            logger.error(f"Error creating time series plot: {e}")
            return ""

    def _create_temperature_profile_plotly(self, profiles: List[Dict]) -> str:
        """Create temperature profile using Plotly"""
        fig = make_subplots(
            rows=1, cols=1,
            subplot_titles=['Temperature vs Depth Profiles'],
            specs=[[{"type": "scatter"}]]
        )

        colors = px.colors.qualitative.Set3

        for i, profile in enumerate(profiles[:10]):  # Limit to 10 profiles for clarity
            if 'temperature_data' in profile and 'pressure_data' in profile:
                temp_data = profile['temperature_data']
                pres_data = profile['pressure_data']

                if temp_data and pres_data:
                    # Reverse pressure for depth (surface at top)
                    depth_data = [-p for p in pres_data]

                    fig.add_trace(
                        go.Scatter(
                            x=temp_data,
                            y=depth_data,
                            mode='lines+markers',
                            name=f"Float {profile.get('float_id', 'N/A')} - Cycle {profile.get('cycle_number', 'N/A')}",
                            line=dict(color=colors[i % len(colors)], width=2),
                            marker=dict(size=4),
                            hovertemplate=
                                "Temperature: %{x:.2f}°C<br>" +
                                "Depth: %{y:.1f} m<br>" +
                                "Float: " + str(profile.get('float_id', 'N/A')) + "<br>" +
                                "<extra></extra>"
                        ),
                        row=1, col=1
                    )

        fig.update_layout(
            **self.ocean_template['layout'],
            title='ARGO Float Temperature Profiles',
            xaxis_title='Temperature (°C)',
            yaxis_title='Depth (m)',
            hovermode='closest',
            showlegend=True
        )

        fig.update_yaxes(autorange="reversed")  # Depth increases downward

        return fig.to_html(full_html=False, include_plotlyjs=True)

    def _create_salinity_profile_plotly(self, profiles: List[Dict]) -> str:
        """Create salinity profile using Plotly"""
        fig = make_subplots(
            rows=1, cols=1,
            subplot_titles=['Salinity vs Depth Profiles'],
            specs=[[{"type": "scatter"}]]
        )

        colors = px.colors.qualitative.Set1

        for i, profile in enumerate(profiles[:10]):
            if 'salinity_data' in profile and 'pressure_data' in profile:
                sal_data = profile['salinity_data']
                pres_data = profile['pressure_data']

                if sal_data and pres_data:
                    depth_data = [-p for p in pres_data]

                    fig.add_trace(
                        go.Scatter(
                            x=sal_data,
                            y=depth_data,
                            mode='lines+markers',
                            name=f"Float {profile.get('float_id', 'N/A')} - Cycle {profile.get('cycle_number', 'N/A')}",
                            line=dict(color=colors[i % len(colors)], width=2),
                            marker=dict(size=4),
                            hovertemplate=
                                "Salinity: %{x:.3f} PSU<br>" +
                                "Depth: %{y:.1f} m<br>" +
                                "Float: " + str(profile.get('float_id', 'N/A')) + "<br>" +
                                "<extra></extra>"
                        ),
                        row=1, col=1
                    )

        fig.update_layout(
            **self.ocean_template['layout'],
            title='ARGO Float Salinity Profiles',
            xaxis_title='Salinity (PSU)',
            yaxis_title='Depth (m)',
            hovermode='closest',
            showlegend=True
        )

        fig.update_yaxes(autorange="reversed")

        return fig.to_html(full_html=False, include_plotlyjs=True)

    def _create_ts_diagram_plotly(self, profiles: List[Dict]) -> str:
        """Create Temperature-Salinity diagram using Plotly"""
        fig = go.Figure()

        colors = px.colors.qualitative.Prism

        for i, profile in enumerate(profiles[:8]):  # Limit for clarity
            if 'temperature_data' in profile and 'salinity_data' in profile:
                temp_data = profile['temperature_data']
                sal_data = profile['salinity_data']

                if temp_data and sal_data:
                    # Use minimum length to match data
                    min_len = min(len(temp_data), len(sal_data))
                    temp_subset = temp_data[:min_len]
                    sal_subset = sal_data[:min_len]

                    fig.add_trace(
                        go.Scatter(
                            x=sal_subset,
                            y=temp_subset,
                            mode='lines+markers',
                            name=f"Float {profile.get('float_id', 'N/A')} - Cycle {profile.get('cycle_number', 'N/A')}",
                            line=dict(color=colors[i % len(colors)], width=2),
                            marker=dict(size=3),
                            hovertemplate=
                                "Salinity: %{x:.3f} PSU<br>" +
                                "Temperature: %{y:.2f}°C<br>" +
                                "Float: " + str(profile.get('float_id', 'N/A')) + "<br>" +
                                "<extra></extra>"
                        )
                    )

        fig.update_layout(
            **self.ocean_template['layout'],
            title='Temperature-Salinity Diagram',
            xaxis_title='Salinity (PSU)',
            yaxis_title='Temperature (°C)',
            hovermode='closest',
            showlegend=True
        )

        return fig.to_html(full_html=False, include_plotlyjs=True)

    def _create_map_view_plotly(self, profiles: List[Dict]) -> str:
        """Create geographic map view using Plotly"""
        fig = go.Figure()

        # Extract coordinates
        lats = []
        lons = []
        texts = []

        for profile in profiles:
            if 'latitude' in profile and 'longitude' in profile:
                lats.append(profile['latitude'])
                lons.append(profile['longitude'])
                texts.append(
                    f"Float: {profile.get('float_id', 'N/A')}<br>" +
                    f"Cycle: {profile.get('cycle_number', 'N/A')}<br>" +
                    f"Date: {profile.get('profile_date', 'N/A')}"
                )

        if lats and lons:
            fig.add_trace(
                go.Scattergeo(
                    lat=lats,
                    lon=lons,
                    mode='markers',
                    marker=dict(
                        size=8,
                        color='blue',
                        opacity=0.7,
                        line=dict(width=1, color='white')
                    ),
                    text=texts,
                    hovertemplate='%{text}<extra></extra>',
                    name='ARGO Profiles'
                )
            )

        fig.update_layout(
            **self.ocean_template['layout'],
            title='ARGO Float Locations',
            geo=dict(
                showframe=False,
                showcoastlines=True,
                projection_type='natural earth'
            ),
            hovermode='closest'
        )

        return fig.to_html(full_html=False, include_plotlyjs=True)

    def _create_time_series_plotly(self, profiles: List[Dict]) -> str:
        """Create time series plot using Plotly"""
        fig = make_subplots(
            rows=2, cols=1,
            subplot_titles=['Surface Temperature', 'Surface Salinity'],
            specs=[[{"type": "scatter"}], [{"type": "scatter"}]]
        )

        # Extract time series data
        dates = []
        surf_temps = []
        surf_sals = []

        for profile in profiles:
            if 'profile_date' in profile and 'temperature_data' in profile:
                try:
                    # Parse date
                    if isinstance(profile['profile_date'], str):
                        date = datetime.fromisoformat(profile['profile_date'].replace('Z', '+00:00'))
                    else:
                        date = profile['profile_date']

                    dates.append(date)

                    # Get surface temperature (first valid measurement)
                    temp_data = profile['temperature_data']
                    if temp_data:
                        surf_temps.append(temp_data[0])
                    else:
                        surf_temps.append(None)

                    # Get surface salinity (first valid measurement)
                    sal_data = profile.get('salinity_data', [])
                    if sal_data:
                        surf_sals.append(sal_data[0])
                    else:
                        surf_sals.append(None)

                except Exception as e:
                    logger.warning(f"Error parsing profile date: {e}")
                    continue

        # Add temperature time series
        if dates and surf_temps:
            valid_data = [(d, t) for d, t in zip(dates, surf_temps) if t is not None]
            if valid_data:
                valid_dates, valid_temps = zip(*valid_data)
                fig.add_trace(
                    go.Scatter(
                        x=valid_dates,
                        y=valid_temps,
                        mode='lines+markers',
                        name='Surface Temperature',
                        line=dict(color='red', width=2),
                        marker=dict(size=4)
                    ),
                    row=1, col=1
                )

        # Add salinity time series
        if dates and surf_sals:
            valid_data = [(d, s) for d, s in zip(dates, surf_sals) if s is not None]
            if valid_data:
                valid_dates, valid_sals = zip(*valid_data)
                fig.add_trace(
                    go.Scatter(
                        x=valid_dates,
                        y=valid_sals,
                        mode='lines+markers',
                        name='Surface Salinity',
                        line=dict(color='blue', width=2),
                        marker=dict(size=4)
                    ),
                    row=2, col=1
                )

        fig.update_layout(
            **self.ocean_template['layout'],
            title='Surface Measurements Time Series',
            hovermode='closest',
            showlegend=True
        )

        fig.update_xaxes(title_text="Date", row=2, col=1)
        fig.update_yaxes(title_text="Temperature (°C)", row=1, col=1)
        fig.update_yaxes(title_text="Salinity (PSU)", row=2, col=1)

        return fig.to_html(full_html=False, include_plotlyjs=True)

    def _create_temperature_profile_matplotlib(self, profiles: List[Dict]) -> str:
        """Create temperature profile using Matplotlib"""
        fig, ax = plt.subplots(figsize=(10, 6))

        colors = plt.cm.tab10(np.linspace(0, 1, len(profiles[:8])))

        for i, profile in enumerate(profiles[:8]):
            if 'temperature_data' in profile and 'pressure_data' in profile:
                temp_data = profile['temperature_data']
                pres_data = profile['pressure_data']

                if temp_data and pres_data:
                    depth_data = [-p for p in pres_data]

                    ax.plot(temp_data, depth_data,
                           marker='o', markersize=3,
                           color=colors[i],
                           label=f"Float {profile.get('float_id', 'N/A')}")

        ax.set_xlabel('Temperature (°C)')
        ax.set_ylabel('Depth (m)')
        ax.set_title('ARGO Float Temperature Profiles')
        ax.grid(True, alpha=0.3)
        ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')

        # Save to base64 string
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
        plt.close(fig)
        img_buffer.seek(0)

        img_base64 = base64.b64encode(img_buffer.read()).decode('utf-8')
        return f"data:image/png;base64,{img_base64}"

    def _create_salinity_profile_matplotlib(self, profiles: List[Dict]) -> str:
        """Create salinity profile using Matplotlib"""
        fig, ax = plt.subplots(figsize=(10, 6))

        colors = plt.cm.Set1(np.linspace(0, 1, len(profiles[:8])))

        for i, profile in enumerate(profiles[:8]):
            if 'salinity_data' in profile and 'pressure_data' in profile:
                sal_data = profile['salinity_data']
                pres_data = profile['pressure_data']

                if sal_data and pres_data:
                    depth_data = [-p for p in pres_data]

                    ax.plot(sal_data, depth_data,
                           marker='s', markersize=3,
                           color=colors[i],
                           label=f"Float {profile.get('float_id', 'N/A')}")

        ax.set_xlabel('Salinity (PSU)')
        ax.set_ylabel('Depth (m)')
        ax.set_title('ARGO Float Salinity Profiles')
        ax.grid(True, alpha=0.3)
        ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')

        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
        plt.close(fig)
        img_buffer.seek(0)

        img_base64 = base64.b64encode(img_buffer.read()).decode('utf-8')
        return f"data:image/png;base64,{img_base64}"

    def _create_ts_diagram_matplotlib(self, profiles: List[Dict]) -> str:
        """Create Temperature-Salinity diagram using Matplotlib"""
        fig, ax = plt.subplots(figsize=(8, 6))

        colors = plt.cm.viridis(np.linspace(0, 1, len(profiles[:6])))

        for i, profile in enumerate(profiles[:6]):
            if 'temperature_data' in profile and 'salinity_data' in profile:
                temp_data = profile['temperature_data']
                sal_data = profile['salinity_data']

                if temp_data and sal_data:
                    min_len = min(len(temp_data), len(sal_data))
                    ax.scatter(sal_data[:min_len], temp_data[:min_len],
                              c=[colors[i]] * min_len, s=20, alpha=0.7,
                              label=f"Float {profile.get('float_id', 'N/A')}")

        ax.set_xlabel('Salinity (PSU)')
        ax.set_ylabel('Temperature (°C)')
        ax.set_title('Temperature-Salinity Diagram')
        ax.grid(True, alpha=0.3)
        ax.legend()

        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
        plt.close(fig)
        img_buffer.seek(0)

        img_base64 = base64.b64encode(img_buffer.read()).decode('utf-8')
        return f"data:image/png;base64,{img_base64}"

    def _create_map_view_matplotlib(self, profiles: List[Dict]) -> str:
        """Create map view using Matplotlib"""
        fig, ax = plt.subplots(figsize=(12, 8), subplot_kw={'projection': ' PlateCarree'})

        # Extract coordinates
        lats = []
        lons = []

        for profile in profiles:
            if 'latitude' in profile and 'longitude' in profile:
                lats.append(profile['latitude'])
                lons.append(profile['longitude'])

        if lats and lons:
            ax.scatter(lons, lats, c='blue', s=30, alpha=0.7, transform=ax.transPlateCarree)
            ax.coastlines()
            ax.gridlines(draw_labels=True)

        ax.set_title('ARGO Float Locations')
        ax.set_xlabel('Longitude')
        ax.set_ylabel('Latitude')

        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
        plt.close(fig)
        img_buffer.seek(0)

        img_base64 = base64.b64encode(img_buffer.read()).decode('utf-8')
        return f"data:image/png;base64,{img_base64}"

    def _create_time_series_matplotlib(self, profiles: List[Dict]) -> str:
        """Create time series plot using Matplotlib"""
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))

        # Extract time series data
        dates = []
        surf_temps = []
        surf_sals = []

        for profile in profiles:
            if 'profile_date' in profile and 'temperature_data' in profile:
                try:
                    if isinstance(profile['profile_date'], str):
                        date = datetime.fromisoformat(profile['profile_date'].replace('Z', '+00:00'))
                    else:
                        date = profile['profile_date']

                    dates.append(date)

                    temp_data = profile['temperature_data']
                    if temp_data:
                        surf_temps.append(temp_data[0])
                    else:
                        surf_temps.append(None)

                    sal_data = profile.get('salinity_data', [])
                    if sal_data:
                        surf_sals.append(sal_data[0])
                    else:
                        surf_sals.append(None)

                except Exception as e:
                    continue

        # Plot temperature
        if dates and surf_temps:
            valid_data = [(d, t) for d, t in zip(dates, surf_temps) if t is not None]
            if valid_data:
                valid_dates, valid_temps = zip(*valid_data)
                ax1.plot(valid_dates, valid_temps, 'r-o', markersize=4, linewidth=2)
                ax1.set_ylabel('Temperature (°C)')
                ax1.set_title('Surface Measurements Time Series')
                ax1.grid(True, alpha=0.3)

        # Plot salinity
        if dates and surf_sals:
            valid_data = [(d, s) for d, s in zip(dates, surf_sals) if s is not None]
            if valid_data:
                valid_dates, valid_sals = zip(*valid_data)
                ax2.plot(valid_dates, valid_sals, 'b-s', markersize=4, linewidth=2)
                ax2.set_ylabel('Salinity (PSU)')
                ax2.set_xlabel('Date')
                ax2.grid(True, alpha=0.3)

        plt.tight_layout()

        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
        plt.close(fig)
        img_buffer.seek(0)

        img_base64 = base64.b64encode(img_buffer.read()).decode('utf-8')
        return f"data:image/png;base64,{img_base64}"

    def create_comprehensive_dashboard(self, profiles: List[Dict]) -> str:
        """Create comprehensive dashboard with multiple visualizations"""
        try:
            # Create subplots
            fig = make_subplots(
                rows=2, cols=2,
                subplot_titles=['Temperature Profiles', 'Salinity Profiles', 'T-S Diagram', 'Geographic Distribution'],
                specs=[
                    [{"type": "scatter"}, {"type": "scatter"}],
                    [{"type": "scatter"}, {"type": "scatter"}]
                ],
                vertical_spacing=0.1,
                horizontal_spacing=0.1
            )

            colors = px.colors.qualitative.Set3

            # Temperature profiles
            for i, profile in enumerate(profiles[:5]):
                if 'temperature_data' in profile and 'pressure_data' in profile:
                    temp_data = profile['temperature_data']
                    pres_data = profile['pressure_data']
                    if temp_data and pres_data:
                        depth_data = [-p for p in pres_data]
                        fig.add_trace(
                            go.Scatter(
                                x=temp_data, y=depth_data,
                                mode='lines', line=dict(color=colors[i], width=2),
                                name=f"Float {profile.get('float_id', 'N/A')}",
                                showlegend=True
                            ),
                            row=1, col=1
                        )

            # Salinity profiles
            for i, profile in enumerate(profiles[:5]):
                if 'salinity_data' in profile and 'pressure_data' in profile:
                    sal_data = profile['salinity_data']
                    pres_data = profile['pressure_data']
                    if sal_data and pres_data:
                        depth_data = [-p for p in pres_data]
                        fig.add_trace(
                            go.Scatter(
                                x=sal_data, y=depth_data,
                                mode='lines', line=dict(color=colors[i], width=2),
                                name=f"Float {profile.get('float_id', 'N/A')}",
                                showlegend=True
                            ),
                            row=1, col=2
                        )

            # T-S Diagram
            for i, profile in enumerate(profiles[:5]):
                if 'temperature_data' in profile and 'salinity_data' in profile:
                    temp_data = profile['temperature_data']
                    sal_data = profile['salinity_data']
                    if temp_data and sal_data:
                        min_len = min(len(temp_data), len(sal_data))
                        fig.add_trace(
                            go.Scatter(
                                x=sal_data[:min_len], y=temp_data[:min_len],
                                mode='markers', marker=dict(color=colors[i], size=4),
                                name=f"Float {profile.get('float_id', 'N/A')}",
                                showlegend=True
                            ),
                            row=2, col=1
                        )

            # Geographic distribution
            lats = []
            lons = []
            for profile in profiles:
                if 'latitude' in profile and 'longitude' in profile:
                    lats.append(profile['latitude'])
                    lons.append(profile['longitude'])

            if lats and lons:
                fig.add_trace(
                    go.Scattergeo(
                        lat=lats, lon=lons,
                        mode='markers',
                        marker=dict(size=6, color='red', opacity=0.7),
                        name='Profile Locations',
                        showlegend=True
                    ),
                    row=2, col=2
                )

            fig.update_layout(
                **self.ocean_template['layout'],
                title='ARGO Data Analysis Dashboard',
                height=800,
                hovermode='closest'
            )

            # Update axes
            fig.update_xaxes(title_text="Temperature (°C)", row=1, col=1)
            fig.update_yaxes(title_text="Depth (m)", row=1, col=1)
            fig.update_yaxes(autorange="reversed", row=1, col=1)

            fig.update_xaxes(title_text="Salinity (PSU)", row=1, col=2)
            fig.update_yaxes(title_text="Depth (m)", row=1, col=2)
            fig.update_yaxes(autorange="reversed", row=1, col=2)

            fig.update_xaxes(title_text="Salinity (PSU)", row=2, col=1)
            fig.update_yaxes(title_text="Temperature (°C)", row=2, col=1)

            fig.update_geos(showcoastlines=True, row=2, col=2)

            return fig.to_html(full_html=False, include_plotlyjs=True)

        except Exception as e:
            logger.error(f"Error creating dashboard: {e}")
            return ""

def create_visualizer() -> ArgoVisualizer:
    """Create visualizer instance"""
    return ArgoVisualizer()

if __name__ == "__main__":
    # Example usage
    visualizer = create_visualizer()

    # Example profile data
    sample_profiles = [
        {
            'float_id': '6901001',
            'cycle_number': 1,
            'profile_date': '2023-01-15T12:00:00',
            'latitude': 45.5,
            'longitude': -125.3,
            'temperature_data': [15.2, 14.8, 12.5, 10.1, 8.7],
            'salinity_data': [34.1, 34.2, 34.5, 34.8, 35.1],
            'pressure_data': [10, 50, 100, 200, 300]
        }
    ]

    # Create visualizations
    temp_plot = visualizer.create_temperature_profile_plot(sample_profiles)
    print("Temperature profile created")

    ts_diagram = visualizer.create_ts_diagram(sample_profiles)
    print("TS diagram created")

    dashboard = visualizer.create_comprehensive_dashboard(sample_profiles)
    print("Dashboard created")
