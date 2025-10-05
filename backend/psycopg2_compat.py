"""
Compatibility layer for psycopg2cffi to work with Django
Registers psycopg2cffi as psycopg2 and adds missing error classes, extensions, and sql modules
"""
import sys
import types

def setup_psycopg2_compat():
    """Setup psycopg2cffi as a drop-in replacement for psycopg2"""
    try:
        # First, register psycopg2cffi as psycopg2
        from psycopg2cffi import compat
        compat.register()
        
        # Import base psycopg2cffi to patch it
        import psycopg2cffi
        
        # Import psycopg2 (which is now psycopg2cffi after compat.register())
        import psycopg2
        
        # Import base exception classes from psycopg2cffi
        from psycopg2cffi import (
            Warning, Error, InterfaceError, DatabaseError,
            DataError, OperationalError, IntegrityError,
            InternalError, ProgrammingError, NotSupportedError
        )
        
        # Import extensions module if it exists
        try:
            from psycopg2cffi import extensions
        except ImportError:
            extensions = types.ModuleType('extensions')
            
        # Import or create sql module
        try:
            from psycopg2cffi import sql
        except ImportError:
            # Create a minimal sql module
            sql = types.ModuleType('sql')
        
        # Create comprehensive errors module
        errors_module = types.ModuleType('errors')
        
        # Standard DB-API 2.0 exceptions
        errors_module.Warning = Warning
        errors_module.Error = Error
        errors_module.InterfaceError = InterfaceError
        errors_module.DatabaseError = DatabaseError
        errors_module.DataError = DataError
        errors_module.OperationalError = OperationalError
        errors_module.IntegrityError = IntegrityError
        errors_module.InternalError = InternalError
        errors_module.ProgrammingError = ProgrammingError
        errors_module.NotSupportedError = NotSupportedError
        
        # PostgreSQL-specific error classes (Django requirements)
        errors_module.UniqueViolation = IntegrityError
        errors_module.ForeignKeyViolation = IntegrityError
        errors_module.CheckViolation = IntegrityError
        errors_module.NotNullViolation = IntegrityError
        errors_module.ExclusionViolation = IntegrityError
        errors_module.InvalidTextRepresentation = DataError
        errors_module.InvalidDatetimeFormat = DataError
        errors_module.NumericValueOutOfRange = DataError
        errors_module.DivisionByZero = DataError
        errors_module.ConnectionDoesNotExist = OperationalError
        errors_module.ConnectionException = OperationalError
        errors_module.DeadlockDetected = OperationalError
        errors_module.SerializationFailure = OperationalError
        errors_module.SyntaxError = ProgrammingError
        errors_module.UndefinedColumn = ProgrammingError
        errors_module.UndefinedTable = ProgrammingError
        errors_module.UndefinedFunction = ProgrammingError
        errors_module.InsufficientPrivilege = OperationalError
        
        # Register errors module in psycopg2cffi namespace
        psycopg2cffi.errors = errors_module
        sys.modules['psycopg2cffi.errors'] = errors_module
        
        # Register errors module in psycopg2 namespace
        psycopg2.errors = errors_module
        sys.modules['psycopg2.errors'] = errors_module
        
        # Register extensions module
        psycopg2cffi.extensions = extensions
        sys.modules['psycopg2cffi.extensions'] = extensions
        psycopg2.extensions = extensions
        sys.modules['psycopg2.extensions'] = extensions
        
        # Register sql module
        psycopg2cffi.sql = sql
        sys.modules['psycopg2cffi.sql'] = sql
        psycopg2.sql = sql
        sys.modules['psycopg2.sql'] = sql
        
        # Also add error classes as module-level attributes for backward compatibility
        if not hasattr(psycopg2, 'DatabaseError'):
            psycopg2.Warning = Warning
            psycopg2.Error = Error
            psycopg2.InterfaceError = InterfaceError
            psycopg2.DatabaseError = DatabaseError
            psycopg2.DataError = DataError
            psycopg2.OperationalError = OperationalError
            psycopg2.IntegrityError = IntegrityError
            psycopg2.InternalError = InternalError
            psycopg2.ProgrammingError = ProgrammingError
            psycopg2.NotSupportedError = NotSupportedError
        
        # Patch Connection class to add 'info' attribute
        # Django's PostgreSQL backend expects connection.info.server_version
        from psycopg2cffi._impl.connection import Connection
        
        if not hasattr(Connection, 'info'):
            class ConnectionInfo:
                """Mock ConnectionInfo object for psycopg2cffi compatibility"""
                def __init__(self, connection):
                    self._connection = connection
                
                @property
                def server_version(self):
                    """Get PostgreSQL server version"""
                    try:
                        # Get version from the connection
                        cursor = self._connection.cursor()
                        cursor.execute("SELECT version()")
                        version_string = cursor.fetchone()[0]
                        cursor.close()
                        
                        # Parse version number from string like "PostgreSQL 13.2..."
                        import re
                        match = re.search(r'PostgreSQL (\d+)\.(\d+)', version_string)
                        if match:
                            major = int(match.group(1))
                            minor = int(match.group(2))
                            # Return as integer: major * 10000 + minor * 100
                            return major * 10000 + minor * 100
                        return 130000  # Default to PostgreSQL 13.0
                    except:
                        return 130000  # Default to PostgreSQL 13.0
            
            # Store original __init__
            original_init = Connection.__init__
            
            def patched_init(self, *args, **kwargs):
                """Patched __init__ to add info attribute"""
                original_init(self, *args, **kwargs)
                self.info = ConnectionInfo(self)
            
            # Apply patch
            Connection.__init__ = patched_init
        
        return True
        
    except ImportError as e:
        # psycopg2cffi not available, might be using regular psycopg2
        print(f"Warning: Could not setup psycopg2cffi compatibility: {e}")
        return False

# Setup compatibility when this module is imported
setup_psycopg2_compat()

