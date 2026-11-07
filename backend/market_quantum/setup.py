from setuptools import setup, find_packages

setup(
    name="market_quantum_copilot",
    version="1.0.0",
    author="Antigravity Team",
    description="Deterministic quantitative ensemble and psychological protection suite for AI trading agents",
    packages=find_packages(),
    install_requires=["numpy>=1.24.0", "aiohttp>=3.9.0", "websockets>=12.0"],
    python_requires=">=3.10",
)
