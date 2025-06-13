import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import './UserGauge.css';

function AppGauge({ value, valueArcColor, label }) {
    return (
        <div className='gauge'>

        <Gauge
            value={value}
            startAngle={0}
            endAngle={360}
            innerRadius="80%"
            outerRadius="100%"

            sx={{
                width: { xs: '75px', sm: '100px', md: '150px' }, 
                height: { xs: '75px', sm: '100px', md: '150px' },
                [`& .${gaugeClasses.valueText}`]: {
                    fontSize: { xs: 12, sm: 18, md: 24 }, 
                    fill: '#628DDE',
                    transform: 'translate(-1px, 0px)',
                },
                [`& .${gaugeClasses.valueText} text`]: {
                    fill: '#628DDE',
                    fontWeight: 'bold',
                },
                [`& .${gaugeClasses.valueArc}`]: {
                    fill: valueArcColor,
                    // fill: '#CCF6D6', // green color
                    // fill: '#FDFFEC', // yellow color
                },
                [`& .${gaugeClasses.referenceArc}`]: {
                    fill: '#628DDE',
                },
            }}
            text={({ value }) => `${value}%`}
        />
        
        <div className='gauge-label'>
            {label}
        </div>
        
        </div>

    );
  }

export default AppGauge